import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-text">IssueTracker</h1>
          <p className="mt-1 text-sm text-text-muted">
            Collaborative project management
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
