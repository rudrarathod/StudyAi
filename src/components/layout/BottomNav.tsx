import { BookOpen, Home, Layers, MessageSquare, Upload, CheckSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: Layers, label: "Flashcards", path: "/flashcards" },
  { icon: CheckSquare, label: "Quizzes", path: "/quizzes" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border)] bg-[var(--background)]/90 px-2 backdrop-blur-md md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors",
              isActive
                ? "text-[var(--primary)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "fill-[var(--primary)]/20")} />
            <span className="scale-90">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
