import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspacesPage from "./pages/WorkspacesPage";
import ProjectsPage from "./pages/ProjectsPage";
import IssuesPage from "./pages/IssuesPage";

export default function App() {
  return (
    <Routes>
      {/* Public auth routes — bounce to /workspaces if already logged in */}
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

      {/* Everything below requires login */}
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
