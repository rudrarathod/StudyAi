import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, query, where, or, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorUtils';

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  author: string;
  userId: string;
  date: string;
  isPublic: boolean;
  views?: string;
  fileData?: string; // base64 encoded file data
  mimeType?: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface UserProfile {
  name: string;
  email: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  theme: 'default' | 'cyberpunk' | 'tropical' | 'rose';
}

interface AppContextType {
  notes: Note[];
  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  flashcards: Flashcard[];
  setFlashcards: (cards: Flashcard[]) => void;
  currentQuiz: Quiz | null;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  isGeneratingFlashcards: boolean;
  setIsGeneratingFlashcards: (isGenerating: boolean) => void;
  isGeneratingQuiz: boolean;
  setIsGeneratingQuiz: (isGenerating: boolean) => void;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);
  const [privateNotes, setPrivateNotes] = useState<Note[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Student",
    email: "",
    notificationsEnabled: true,
    darkMode: prefersDark,
    theme: 'default'
  });

  const notes = React.useMemo(() => {
    const merged = [...publicNotes, ...privateNotes];
    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
    unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return unique;
  }, [publicNotes, privateNotes]);

  useEffect(() => {
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, [prefersDark]);

  useEffect(() => {
    // 1. Always fetch public notes
    const publicQuery = query(
      collection(db, 'notes'),
      where('isPublic', '==', true)
    );

    const unsubPublic = onSnapshot(publicQuery, (snapshot) => {
      const fetched: Note[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Note);
      });
      setPublicNotes(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    // 2. Fetch private notes only if user is logged in
    let unsubPrivate: (() => void) | undefined;

    if (user) {
      const privateQuery = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        where('isPublic', '==', false)
      );

      unsubPrivate = onSnapshot(privateQuery, (snapshot) => {
        const fetched: Note[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Note);
        });
        setPrivateNotes(fetched);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notes');
      });
    } else {
      setPrivateNotes([]); // Clear private notes on logout
    }

    return () => {
      unsubPublic();
      if (unsubPrivate) unsubPrivate();
    };
  }, [user]);

  const addNote = async (note: Note) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'notes', note.id), {
        title: note.title,
        subject: note.subject,
        content: note.content,
        tags: note.tags,
        author: note.author,
        userId: note.userId,
        date: note.date,
        isPublic: note.isPublic,
        ...(note.views && { views: note.views }),
        ...(note.fileData && { fileData: note.fileData }),
        ...(note.mimeType && { mimeType: note.mimeType })
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'notes', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notes/${id}`);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const newProfile = { ...prev, ...updates };
      
      if (updates.darkMode !== undefined) {
        if (updates.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      if (updates.theme !== undefined) {
        // Remove all theme classes
        document.documentElement.classList.remove('theme-cyberpunk', 'theme-tropical', 'theme-rose');
        // Add new theme class if not default
        if (updates.theme !== 'default') {
          document.documentElement.classList.add(`theme-${updates.theme}`);
        }
      }
      
      return newProfile;
    });
  };

  return (
    <AppContext.Provider value={{ 
      notes, addNote, updateNote, deleteNote, 
      flashcards, setFlashcards, 
      currentQuiz, setCurrentQuiz,
      isGeneratingFlashcards, setIsGeneratingFlashcards,
      isGeneratingQuiz, setIsGeneratingQuiz,
      userProfile, updateUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
