import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, Paperclip, Sparkles, X, Loader2, Search, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAppContext, Note } from "../context/AppContext";
import { chatWithNotes } from "../lib/gemini";
import Markdown from "react-markdown";

export function AIChat() {
  const [searchParams] = useSearchParams();
  const initialNoteId = searchParams.get('noteId');
  const { notes } = useAppContext();
  
  const [selectedNotes, setSelectedNotes] = useState<Note[]>(() => {
    const note = notes.find(n => n.id === initialNoteId);
    return note ? [note] : [];
  });
  
  const [messages, setMessages] = useState<{id: number, role: string, content: string, sources?: string[]}[]>([
    { 
      id: 1, 
      role: "ai", 
      content: selectedNotes.length > 0 
        ? `Hi! I'm your AI tutor. I've analyzed your selected notes. What would you like to learn today?`
        : "Hi! I'm your AI tutor. Please select some notes to start chatting about them." 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const newUserMsg = { id: Date.now(), role: "user", content: input };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);
    
    try {
      const context = selectedNotes.length > 0 
        ? selectedNotes.map(n => `Title: ${n.title}\nSubject: ${n.subject}\n\nContent:\n${n.content}`).join('\n\n---\n\n')
        : "No specific notes selected. Answer generally.";
      
      // Prepare message history for Gemini (excluding the initial greeting if it's just a greeting)
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content })).concat({ role: "user", content: input });
      
      const inlineDataList = selectedNotes
        .filter(n => n.fileData && n.mimeType)
        .map(n => ({ data: n.fileData!, mimeType: n.mimeType! }));

      const response = await chatWithNotes(chatHistory, context, inlineDataList.length > 0 ? inlineDataList : undefined);
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: "ai", 
        content: response,
        sources: selectedNotes.length > 0 ? selectedNotes.map(n => n.title) : undefined
      }]);
    } catch (error: any) {
      console.error(error);
      const isMissingKey = error?.message?.includes("Gemini API Key");
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: "ai", 
        content: isMissingKey 
          ? "Gemini API Key is not set. Please configure your API key in the [Profile](/profile) page."
          : "Sorry, I encountered an error while trying to respond. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNoteSelection = (note: Note) => {
    setSelectedNotes(prev => {
      const isSelected = prev.some(n => n.id === note.id);
      if (isSelected) {
        return prev.filter(n => n.id !== note.id);
      } else {
        return [...prev, note];
      }
    });
  };

  const removeNote = (noteId: string) => {
    setSelectedNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-4rem)] animate-in fade-in duration-500 relative">
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm font-medium text-[var(--muted-foreground)] whitespace-nowrap">Sources:</span>
        {selectedNotes.length > 0 ? (
          selectedNotes.map(note => (
            <div key={note.id} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium">
              <span className="truncate max-w-[150px]">{note.title}</span>
              <button onClick={() => removeNote(note.id)} className="ml-1 rounded-full p-0.5 hover:bg-[var(--muted)]">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))
        ) : (
          <span className="text-xs text-[var(--muted-foreground)] italic">None selected</span>
        )}
        <button 
          onClick={() => setShowNoteSelector(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] whitespace-nowrap"
        >
          <Paperclip className="h-3 w-3" />
          Add Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-t-2xl border border-[var(--border)] border-b-0 bg-[var(--card)] p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full gap-4 animate-in slide-in-from-bottom-2 duration-300",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "ai" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm md:max-w-[75%]",
                msg.role === "user"
                  ? "bg-[var(--primary)] text-white rounded-tr-sm"
                  : "bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm"
              )}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
              {msg.sources && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border)]/50 pt-2">
                  {msg.sources.map((source, i) => (
                    <span key={i} className="rounded-md bg-[var(--background)] px-2 py-1 text-[10px] font-medium text-[var(--muted-foreground)]">
                      {source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full gap-4 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm md:max-w-[75%] bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
              <span className="text-[var(--muted-foreground)]">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="rounded-b-2xl border border-[var(--border)] bg-[var(--card)] p-3 md:p-4">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]">
          <button 
            type="button" 
            onClick={() => setShowNoteSelector(true)}
            className="shrink-0 rounded-full p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your notes..."
            className="max-h-32 min-h-[40px] w-full resize-none bg-transparent py-2 text-sm outline-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 rounded-full bg-[var(--primary)] p-2 text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </form>
        <div className="mt-2 text-center text-[10px] text-[var(--muted-foreground)]">
          AI can make mistakes. Verify important information.
        </div>
      </div>

      {/* Note Selector Modal */}
      {showNoteSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={() => setShowNoteSelector(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] p-6 shadow-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Select Notes for Context</h2>
              <button onClick={() => setShowNoteSelector(false)} className="rounded-full p-1 hover:bg-[var(--muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  No notes found.
                </div>
              ) : (
                filteredNotes.map(note => {
                  const isSelected = selectedNotes.some(n => n.id === note.id);
                  return (
                    <div 
                      key={note.id}
                      onClick={() => toggleNoteSelection(note)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                        isSelected 
                          ? "border-[var(--primary)] bg-[var(--primary)]/5" 
                          : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                        isSelected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--muted-foreground)]"
                      )}>
                        {isSelected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-medium text-sm truncate">{note.title}</h4>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{note.subject}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowNoteSelector(false)}
                className="rounded-lg bg-[var(--primary)] px-6 py-2 font-medium text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
