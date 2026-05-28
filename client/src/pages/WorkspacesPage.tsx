import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaces, useCreateWorkspace } from '../hooks/useWorkspaces';

export default function WorkspacesPage() {
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const createMutation = useCreateWorkspace();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate(name, { onSuccess: () => setName('') });
  };

  if (isLoading) return <p>Loading workspaces...</p>;
  if (isError) return <p>Failed to load workspaces.</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Workspaces</h1>

      <div style={{ marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New workspace name"
        />
        <button onClick={handleCreate} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>

      <ul>
        {workspaces?.map((ws) => (
          <li key={ws.id}>
            <Link to={`/workspaces/${ws.id}/projects`}>{ws.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}