import { Routes, Route, Navigate } from 'react-router-dom';
import WorkspacesPage from './pages/WorkspacesPage';
import ProjectsPage from './pages/ProjectsPage';
import IssuesPage from './pages/IssuesPage';
import Layout from './components/Layout';


export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/workspaces" />} />
      <Route path="/workspaces" element={<WorkspacesPage />} />
      <Route path="/workspaces/:workspaceId/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId/issues" element={<IssuesPage />} />
    </Routes>
    </Layout>
  );
}