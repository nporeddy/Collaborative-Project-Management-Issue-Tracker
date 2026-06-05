import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./Spinner";

export default function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (user) {
    if (!user.emailVerified) {
      if (
        location.pathname === "/verify-email" ||
        location.pathname === "/register"
      ) {
        return <>{children}</>;
      }
      return <Navigate to="/verify-email" replace />;
    }
    return <Navigate to="/workspaces" replace />;
  }

  return <>{children}</>;
}
