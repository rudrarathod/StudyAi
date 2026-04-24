import { BookOpen, Home, Layers, MessageSquare, Upload, CheckSquare, ChevronLeft, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: Layers, label: "Flashcards", path: "/flashcards" },
  { icon: CheckSquare, label: "Quizzes", path: "/quizzes" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "hidden flex-col border-r border-[var(--border)] bg-[var(--card)] transition-all duration-300 md:flex",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {isOpen && (
          <span className="text-xl font-bold tracking-tight text-[var(--primary)]">
            StudyAI
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
            !isOpen && "mx-auto"
          )}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", !isOpen && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                !isOpen && "justify-center px-0"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "fill-[var(--primary)]/20")} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
