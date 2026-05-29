import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-surface flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-base font-semibold text-text">IssueTracker</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/workspaces"
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/workspaces') || isActive('/projects')
                ? 'bg-gray-100 text-text'
                : 'text-text-muted hover:bg-gray-50 hover:text-text'
            }`}
          >
            Workspaces
          </Link>
        </nav>

        <div className="px-6 py-4 border-t border-border text-xs text-text-subtle">
          v0.1.0
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}