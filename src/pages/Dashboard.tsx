import React from "react";
import { BookOpen, MessageSquare, Upload, Sparkles, Clock, TrendingUp, ChevronRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAppContext, Note } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  const { notes } = useAppContext();
  const { user } = useAuth();
  const recentNotes = notes.slice(0, 3);
  const trendingNotes = notes.filter(n => n.views).sort((a, b) => parseInt(b.views || "0") - parseInt(a.views || "0")).slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">Ready to ace your next exam?</p>
      </section>

      {user && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickActionCard
              to="/upload"
              icon={Upload}
              title="Upload Material"
              description="PDFs, docs, or images"
              color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <QuickActionCard
              to="/chat"
              icon={MessageSquare}
              title="AI Tutor Chat"
              description="Ask questions about notes"
              color="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            />
            <QuickActionCard
              to="/quizzes"
              icon={Sparkles}
              title="Generate Quiz"
              description="Test your knowledge"
              color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-[var(--primary)]" />
              Recent Notes
            </h2>
            <Link to="/library" className="text-sm font-medium text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotes.length > 0 ? recentNotes.map((note) => (
              <NoteListItem key={note.id} note={note} />
            )) : (
              <p className="text-sm text-[var(--muted-foreground)]">No notes yet. Upload one to get started!</p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Trending Notes
            </h2>
          </div>
          <div className="space-y-3">
            {trendingNotes.length > 0 ? trendingNotes.map((note) => (
              <NoteListItem key={note.id} note={note} isTrending />
            )) : (
              <p className="text-sm text-[var(--muted-foreground)]">Upload notes to see trending topics.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

function QuickActionCard({ to, icon: Icon, title, description, color }: QuickActionCardProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--primary)]/50"
    >
      <div className={cn("rounded-xl p-3 transition-transform group-hover:scale-110", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
    </Link>
  );
}

interface NoteListItemProps {
  note: Note;
  isTrending?: boolean;
}

function NoteListItem({ note, isTrending }: NoteListItemProps) {
  return (
    <Link
      to={`/note/${note.id}`}
      className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--primary)]/50 hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium line-clamp-1">{note.title}</h4>
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span className="rounded-md bg-[var(--muted)] px-1.5 py-0.5">{note.subject}</span>
            <span>•</span>
            <span>{isTrending ? `${note.views} views` : new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--primary)]" />
    </Link>
  );
}
