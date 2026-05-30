import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // While the session is being restored on app boot, show a spinner.
  // Without this, we'd flash "redirect to login" for a moment before realizing the user IS logged in.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (!user) {
    // Remember where they tried to go, so login can send them back there.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
