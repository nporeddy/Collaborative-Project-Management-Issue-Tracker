import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects, useCreateProject } from '../hooks/useProjects';

export default function ProjectsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data: projects, isLoading, isError } = useProjects(workspaceId!);
  const createMutation = useCreateProject(workspaceId!);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  const handleCreate = () => {
    if (!name.trim() || !key.trim()) return;
    createMutation.mutate({ name, key }, { onSuccess: () => { setName(''); setKey(''); } });
  };

  if (isLoading) return <p>Loading projects...</p>;
  if (isError) return <p>Failed to load projects.</p>;

  return (
    <div style={{ padding: 24 }}>
      <Link to="/workspaces">← Workspaces</Link>
      <h1>Projects</h1>

      <div style={{ marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key (e.g. API)" />
        <button onClick={handleCreate} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>

      <ul>
        {projects?.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}/issues`}>{p.name} ({p.key})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}