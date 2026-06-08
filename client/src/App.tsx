import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspacesPage from "./pages/WorkspacesPage";
import ProjectsPage from "./pages/ProjectsPage";
import IssuesPage from "./pages/IssuesPage";
import MembersPage from "./pages/MembersPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PublicRoute>
            <VerifyEmailPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/workspaces" />} />
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route
                  path="/workspaces/:workspaceId/projects"
                  element={<ProjectsPage />}
                />
                <Route
                  path="/workspaces/:workspaceId/members"
                  element={<MembersPage />}
                />
                <Route
                  path="/projects/:projectId/issues"
                  element={<IssuesPage />}
                />
                <Route
                  path="/projects/:projectId/issues/:issueId"
                  element={<IssuesPage />}
                />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
