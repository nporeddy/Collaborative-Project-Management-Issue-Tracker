import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

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

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm">
        <Link to="/workspaces" className="text-text-muted hover:text-text transition-colors">
          Workspaces
        </Link>
        <span className="mx-2 text-text-subtle">/</span>
        <span className="text-text">Projects</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text">Projects</h1>
        <p className="mt-1 text-sm text-text-muted">
          Projects group related issues within a workspace.
        </p>
      </div>

      {/* Create form */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="flex-1"
          />
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder="KEY"
            maxLength={10}
            className="sm:w-32"
          />
          <Button onClick={handleCreate} disabled={createMutation.isPending || !name.trim() || !key.trim()}>
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <Spinner label="Loading projects…" />
      ) : isError ? (
        <Card><p className="text-sm text-danger">Failed to load projects.</p></Card>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project above."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}/issues`} className="block group">
              <Card className="group-hover:border-primary cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-xs font-semibold text-text">
                        {p.key.slice(0, 2)}
                      </span>
                      <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors truncate">
                        {p.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-text-muted">
                      Key <span className="font-mono">{p.key}</span> · Created {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-text-subtle group-hover:text-primary transition-colors">→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}