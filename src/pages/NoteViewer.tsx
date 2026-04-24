import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, BookOpen, Layers, MessageSquare, Sparkles, MoreVertical, Loader2, FileText, X, Download, LucideIcon } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { generateFlashcards, generateQuiz, generateSummary } from "../lib/gemini";
import Markdown from "react-markdown";
import { PDFViewer } from "../components/PDFViewer";

export function NoteViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    notes, 
    setFlashcards, 
    setCurrentQuiz, 
    deleteNote, 
    updateNote,
    isGeneratingFlashcards,
    setIsGeneratingFlashcards,
    isGeneratingQuiz,
    setIsGeneratingQuiz
  } = useAppContext();
  const { user } = useAuth();
  
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editForm, setEditForm] = useState({ title: '', subject: '', visibility: 'private' });

  const note = notes.find(n => n.id === id);
  const isOwner = user?.uid === note?.userId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Note not found</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">This note might have been deleted or doesn't exist.</p>
        <Link to="/library" className="mt-6 rounded-full bg-[var(--primary)] px-6 py-2 font-medium text-white">
          Back to Library
        </Link>
      </div>
    );
  }

  const openEditModal = () => {
    setEditForm({
      title: note.title,
      subject: note.subject,
      visibility: note.isPublic ? 'public' : 'private'
    });
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    updateNote(note.id, {
      title: editForm.title,
      subject: editForm.subject,
      isPublic: editForm.visibility === 'public'
    });
    setShowEditModal(false);
  };

  const handleDelete = () => {
    deleteNote(note.id);
    navigate('/library');
  };

  const handleDownload = () => {
    if (!note.fileData) return;
    
    try {
      const byteCharacters = atob(note.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: note.mimeType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download the PDF file.");
    }
  };

  const handleGenerateFlashcards = () => {
    setIsGeneratingFlashcards(true);
    navigate('/flashcards');
    
    // Fire and forget
    (async () => {
      try {
        const inlineData = note.fileData && note.mimeType ? { data: note.fileData, mimeType: note.mimeType } : undefined;
        const cards = await generateFlashcards(note.content, inlineData);
        // Give them IDs
        const cardsWithIds = cards.map((c: any, i: number) => ({ ...c, id: i + 1 }));
        setFlashcards(cardsWithIds);
      } catch (error) {
        console.error(error);
        alert("Failed to generate flashcards. Please try again.");
      } finally {
        setIsGeneratingFlashcards(false);
      }
    })();
  };

  const handleGenerateQuiz = () => {
    setIsGeneratingQuiz(true);
    navigate('/quizzes');
    
    // Fire and forget
    (async () => {
      try {
        const inlineData = note.fileData && note.mimeType ? { data: note.fileData, mimeType: note.mimeType } : undefined;
        const quiz = await generateQuiz(note.content, inlineData);
        setCurrentQuiz(quiz);
      } catch (error) {
        console.error(error);
        alert("Failed to generate quiz. Please try again.");
      } finally {
        setIsGeneratingQuiz(false);
      }
    })();
  };

  const handleGenerateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const inlineData = note.fileData && note.mimeType ? { data: note.fileData, mimeType: note.mimeType } : undefined;
      const result = await generateSummary(note.content, inlineData);
      setSummary(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate summary. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-4rem)] md:flex-row gap-6 animate-in fade-in duration-500">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <Link to="/library" className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold line-clamp-1">{note.title}</h1>
              <p className="text-xs text-[var(--muted-foreground)]">{note.subject} • {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {note.mimeType === 'application/pdf' && note.fileData && (
              <button
                onClick={handleDownload}
                className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                title="Download PDF"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-full p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg z-50 py-1">
                    <button 
                      onClick={openEditModal} 
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)]"
                    >
                      Edit Note
                    </button>
                    <button 
                      onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }} 
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                    >
                      Delete Note
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {summary && (
            <div className="mb-6 rounded-xl border border-[var(--primary)]/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 relative animate-in slide-in-from-top-4 fade-in duration-300">
              <button 
                onClick={() => setSummary(null)}
                className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Close summary"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--primary)]">
                <Sparkles className="h-5 w-5" />
                AI Summary
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <Markdown>{summary}</Markdown>
              </div>
            </div>
          )}

          {note.mimeType === 'application/pdf' && note.fileData ? (
            <PDFViewer base64Data={note.fileData} />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{note.content}</Markdown>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="hidden w-80 flex-col gap-4 md:flex">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Tools
            </h2>
            <div className="space-y-2">
              <AIToolButton 
                icon={FileText} 
                label="Summarize" 
                description="Get a quick overview" 
                onClick={handleGenerateSummary}
                isLoading={isGeneratingSummary}
              />
              <AIToolButton 
                icon={MessageSquare} 
                label="Chat with Note" 
                description="Ask questions about this content" 
                onClick={() => navigate(`/chat?noteId=${note.id}`)}
              />
              <AIToolButton 
                icon={Layers} 
                label="Create Flashcards" 
                description="Generate study cards" 
                onClick={handleGenerateFlashcards}
                isLoading={isGeneratingFlashcards}
              />
              <AIToolButton 
                icon={Sparkles} 
                label="Generate Quiz" 
                description="Test your knowledge" 
                onClick={handleGenerateQuiz}
                isLoading={isGeneratingQuiz}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile AI Tools FAB */}
      {user && (
        <div className="fixed bottom-20 right-4 md:hidden z-50 flex flex-col-reverse items-end gap-3">
          <button 
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 z-50 relative"
          >
            {isFabExpanded ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
          </button>

          {isFabExpanded && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" 
                onClick={() => setIsFabExpanded(false)} 
              />
              <div className="flex flex-col gap-4 z-50 mb-2 animate-in slide-in-from-bottom-10 fade-in duration-200">
                <div className="flex items-center justify-end gap-3">
                  <span className="bg-[var(--card)] text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm border border-[var(--border)]">Generate Quiz</span>
                  <button
                    onClick={() => {
                      setIsFabExpanded(false);
                      handleGenerateQuiz();
                    }}
                    disabled={isGeneratingQuiz}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] text-[var(--primary)] shadow-lg border border-[var(--border)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-70"
                  >
                    {isGeneratingQuiz ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <span className="bg-[var(--card)] text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm border border-[var(--border)]">Create Flashcards</span>
                  <button
                    onClick={() => {
                      setIsFabExpanded(false);
                      handleGenerateFlashcards();
                    }}
                    disabled={isGeneratingFlashcards}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] text-[var(--primary)] shadow-lg border border-[var(--border)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-70"
                  >
                    {isGeneratingFlashcards ? <Loader2 className="h-5 w-5 animate-spin" /> : <Layers className="h-5 w-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <span className="bg-[var(--card)] text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm border border-[var(--border)]">Chat with Note</span>
                  <button
                    onClick={() => {
                      setIsFabExpanded(false);
                      navigate(`/chat?noteId=${note.id}`);
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] text-[var(--primary)] shadow-lg border border-[var(--border)] transition-transform hover:scale-105 active:scale-95"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input 
                  type="text" 
                  value={editForm.subject}
                  onChange={e => setEditForm({...editForm, subject: e.target.value})}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visibility</label>
                <select 
                  value={editForm.visibility}
                  onChange={e => setEditForm({...editForm, visibility: e.target.value})}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="rounded-lg px-4 py-2 font-medium hover:bg-[var(--muted)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--card)] p-6 shadow-xl text-center">
            <h2 className="text-xl font-bold mb-2">Delete Note?</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-4 py-2 font-medium hover:bg-[var(--muted)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AIToolButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  isLoading?: boolean;
}

function AIToolButton({ icon: Icon, label, description, onClick, isLoading }: AIToolButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-left transition-colors hover:border-[var(--primary)]/50 hover:bg-[var(--muted)] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <div className="rounded-lg bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      </div>
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-[var(--muted-foreground)]">{description}</div>
      </div>
    </button>
  );
}
