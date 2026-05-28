import { Routes, Route, Navigate } from 'react-router-dom';
import WorkspacesPage from './pages/WorkspacesPage';
import ProjectsPage from './pages/ProjectsPage';
import IssuesPage from './pages/IssuesPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workspaces" />} />
      <Route path="/workspaces" element={<WorkspacesPage />} />
      <Route path="/workspaces/:workspaceId/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId/issues" element={<IssuesPage />} />
    </Routes>
  );
}