import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIssues, useCreateIssue } from '../hooks/useIssues';

export default function IssuesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading, isError } = useIssues(projectId!);
  const createMutation = useCreateIssue(projectId!);
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({ title }, { onSuccess: () => setTitle('') });
  };

  if (isLoading) return <p>Loading issues...</p>;
  if (isError) return <p>Failed to load issues.</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Issues</h1>

      <div style={{ marginBottom: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Issue title" />
        <button onClick={handleCreate} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>

      <ul>
        {data?.items.map((issue) => (
          <li key={issue.id}>
            [{issue.status}] {issue.title} — {issue.priority}
          </li>
        ))}
      </ul>
    </div>
  );
}