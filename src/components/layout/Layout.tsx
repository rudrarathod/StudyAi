import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { ErrorBoundary } from "../ErrorBoundary";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
