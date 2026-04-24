import { Bell, Menu, Upload, User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function TopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hidden rounded-md p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] md:block"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="md:hidden">
          <span className="text-lg font-bold tracking-tight text-[var(--primary)]">
            StudyAI
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        {user ? (
          <>
            <Link
              to="/upload"
              className="hidden items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 md:flex"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>

            <button className="rounded-full p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
              <Bell className="h-5 w-5" />
            </button>

            <Link to="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
              <User className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
