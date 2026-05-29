import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspaces, useCreateWorkspace } from "../hooks/useWorkspaces";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";

export default function WorkspacesPage() {
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const createMutation = useCreateWorkspace();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate(name, { onSuccess: () => setName("") });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-text">Workspaces</h1>
        <p className="mt-1 text-sm text-text-muted">
          Organize your projects into workspaces for your team.
        </p>
      </div>

      {/* Create form */}
      <Card className="!p-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New workspace name"
          />
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending ? "Creating…" : "Create"}
          </Button>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <Spinner label="Loading workspaces…" />
      ) : isError ? (
        <Card>
          <p className="text-sm text-danger">Failed to load workspaces.</p>
        </Card>
      ) : !workspaces || workspaces.length === 0 ? (
        <EmptyState
          title="No workspaces yet"
          description="Create your first workspace above to get started."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/workspaces/${ws.id}/projects`}
              className="block group"
            >
              <Card className="group-hover:border-primary cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                      {ws.name}
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      Created {new Date(ws.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-text-subtle group-hover:text-primary transition-colors">
                    →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
