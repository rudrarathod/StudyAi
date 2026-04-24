import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, MoreVertical, FileText, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAppContext, Note } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const subjects = ["All", "Data Structures", "Algorithms", "Operating Systems", "Networking", "Database Systems", "AI & ML", "ETC", "Other"];

export function Library() {
  const [activeSubject, setActiveSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const { notes } = useAppContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  const filteredNotes = notes.filter(note => {
    const matchesSubject = activeSubject === "All" || note.subject.toLowerCase() === activeSubject.toLowerCase();
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (note.tags && note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSubject && matchesSearch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "a-z") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "z-a") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Library</h1>
          <p className="text-[var(--muted-foreground)]">Manage and explore your study materials.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="search"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-[var(--border)] bg-[var(--card)] pl-9 pr-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="relative" ref={sortMenuRef}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium hover:bg-[var(--muted)]"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </button>
            
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg z-50 py-1">
                <button 
                  onClick={() => { setSortBy("newest"); setShowSortMenu(false); }} 
                  className={cn("w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)]", sortBy === "newest" && "text-[var(--primary)] font-medium")}
                >
                  Newest First
                </button>
                <button 
                  onClick={() => { setSortBy("oldest"); setShowSortMenu(false); }} 
                  className={cn("w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)]", sortBy === "oldest" && "text-[var(--primary)] font-medium")}
                >
                  Oldest First
                </button>
                <button 
                  onClick={() => { setSortBy("a-z"); setShowSortMenu(false); }} 
                  className={cn("w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)]", sortBy === "a-z" && "text-[var(--primary)] font-medium")}
                >
                  Title (A-Z)
                </button>
                <button 
                  onClick={() => { setSortBy("z-a"); setShowSortMenu(false); }} 
                  className={cn("w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)]", sortBy === "z-a" && "text-[var(--primary)] font-medium")}
                >
                  Title (Z-A)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeSubject === subject
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
            )}
          >
            {subject}
          </button>
        ))}
      </div>

      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-[var(--muted)] p-4 text-[var(--muted-foreground)]">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium">No notes found</h3>
          <p className="text-[var(--muted-foreground)]">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note }: { key?: React.Key; note: Note }) {
  const { deleteNote, updateNote } = useAppContext();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editForm, setEditForm] = useState({ 
    title: note.title, 
    subject: note.subject, 
    visibility: note.isPublic ? 'public' : 'private' 
  });

  const isOwner = user?.uid === note.userId;

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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const openEditModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditForm({
      title: note.title,
      subject: note.subject,
      visibility: note.isPublic ? 'public' : 'private'
    });
    setShowEditModal(true);
    setShowMenu(false);
  };

  const openDeleteConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateNote(note.id, {
      title: editForm.title,
      subject: editForm.subject,
      isPublic: editForm.visibility === 'public'
    });
    setShowEditModal(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNote(note.id);
  };

  const closeModals = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditModal(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[var(--primary)]/50">
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FileText className="h-5 w-5" />
          </div>
          {isOwner && (
            <div className="relative z-20" ref={menuRef}>
              <button 
                onClick={handleMenuClick}
                className="rounded-full p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg z-50 py-1">
                  <button 
                    onClick={openEditModal} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)]"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={openDeleteConfirm} 
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <h3 className="mb-1 font-semibold leading-tight line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          <Link to={`/note/${note.id}`} className="before:absolute before:inset-0 before:z-10">
            {note.title}
          </Link>
        </h3>
        
        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)] relative z-20 pointer-events-none">
          <span className="font-medium text-[var(--foreground)]">{note.subject}</span>
          <span>•</span>
          <span>{new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-1.5 relative z-20 pointer-events-none">
          {note.tags && note.tags.map((tag: string) => (
            <span key={tag} className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 relative z-20 pointer-events-none">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-medium">
            {note.author ? note.author.charAt(0).toUpperCase() : '?'}
          </div>
          <span>{note.author || 'Anonymous'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]" title={note.isPublic ? "Public" : "Private"}>
          {note.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={closeModals}>
          <div className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 shadow-xl" onClick={e => e.stopPropagation()}>
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
                onClick={closeModals}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={closeModals}>
          <div className="w-full max-w-sm rounded-2xl bg-[var(--card)] p-6 shadow-xl text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Delete Note?</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={closeModals}
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
