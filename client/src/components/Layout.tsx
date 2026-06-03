import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSocket } from "../lib/socket";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, socketConnected } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

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
              isActive("/workspaces") || isActive("/projects")
                ? "bg-gray-100 text-text"
                : "text-text-muted hover:bg-gray-50 hover:text-text"
            }`}
          >
            Workspaces
          </Link>
        </nav>

        {user && (
          <div className="px-3 py-3 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center shrink-0 relative">
                {initial}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                    socketConnected ? "bg-success" : "bg-text-subtle"
                  }`}
                  title={socketConnected ? "Connected" : "Reconnecting…"}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text truncate">
                  {user.name}
                </p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 w-full text-left px-3 py-2 rounded-md text-sm text-text-muted hover:bg-gray-50 hover:text-text transition-colors"
            >
              Sign out
            </button>
            <button
              onClick={() => {
                const s = getSocket();
                if (!s) return console.log("No socket");
                s.emit("ping", {
                  message: "hello from client",
                  at: Date.now(),
                });
                s.once("pong", (data: { echo: unknown; serverTime: number }) =>
                  console.log("Got pong:", data),
                );
              }}
              className="w-full text-left px-3 py-2 rounded-md text-xs text-text-subtle hover:bg-gray-50 hover:text-text transition-colors"
            >
              🔌 Ping server
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
