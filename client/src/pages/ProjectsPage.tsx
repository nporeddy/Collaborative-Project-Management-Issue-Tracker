import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";
import { useWorkspace } from "../hooks/useWorkspaces";
import { useMyRole } from "../hooks/useMembers";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import ConfirmDialog from "../components/ConfirmDialog";

interface Project {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { data: workspace } = useWorkspace(workspaceId!);
  const { data: projects, isLoading, isError } = useProjects(workspaceId!);
  const myRole = useMyRole(workspaceId);
  const createMutation = useCreateProject(workspaceId!);
  const updateMutation = useUpdateProject(workspaceId!);
  const deleteMutation = useDeleteProject(workspaceId!);

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canCreate = myRole === "ADMIN" || myRole === "OWNER";
  const canEdit = myRole === "ADMIN" || myRole === "OWNER";

  const handleCreate = () => {
    if (!name.trim() || !key.trim()) return;
    createMutation.mutate(
      { name, key },
      {
        onSuccess: () => {
          setName("");
          setKey("");
        },
      },
    );
  };

  const startEdit = (p: Project) => {
    setActionError(null);
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) {
      setEditingId(null);
      return;
    }
    updateMutation.mutate(
      { id: editingId, name: editingName.trim() },
      {
        onSuccess: () => setEditingId(null),
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ?? "Failed to rename project.";
          setActionError(msg);
          setEditingId(null);
        },
      },
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? "Failed to delete project.";
        setActionError(msg);
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        to="/workspaces"
        className="inline-flex items-center text-sm text-text-muted hover:text-text transition-colors"
      >
        <span className="mr-1">←</span> Back to Workspaces
      </Link>

      {/* Header with Members link */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            {workspace ? (
              <>
                <span className="text-text-muted font-normal">
                  {workspace.name}
                </span>
                <span className="mx-2 text-text-subtle font-normal">·</span>
                Projects
              </>
            ) : (
              "Projects"
            )}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Projects group related issues within a workspace.
          </p>
        </div>

        <Link
          to={`/workspaces/${workspaceId}/members`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-text bg-surface hover:bg-gray-50 border border-border rounded-md transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Members
        </Link>
      </div>

      {/* Create form — admin+ only */}
      {canCreate && (
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
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !name.trim() || !key.trim()}
            >
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </Card>
      )}

      {/* Action error */}
      {actionError && (
        <Card className="!p-3 !bg-red-50 !border-red-200">
          <p className="text-sm text-danger">{actionError}</p>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <Spinner label="Loading projects…" />
      ) : isError ? (
        <Card>
          <p className="text-sm text-danger">Failed to load projects.</p>
        </Card>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            canCreate
              ? "Create your first project above."
              : "Ask an admin to create a project."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p: Project) => {
            const isEditing = editingId === p.id;

            return (
              <Card key={p.id} className="h-full">
                {isEditing ? (
                  // Inline edit mode
                  <div className="flex flex-col gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={saveEdit}
                        disabled={
                          updateMutation.isPending || !editingName.trim()
                        }
                      >
                        {updateMutation.isPending ? "Saving…" : "Save"}
                      </Button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-sm text-text-muted hover:text-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="flex items-start justify-between">
                    <Link
                      to={`/projects/${p.id}/issues`}
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-xs font-semibold text-text">
                          {p.key.slice(0, 2)}
                        </span>
                        <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </h3>
                      </div>
                      <p className="mt-2 text-xs text-text-muted">
                        Key <span className="font-mono">{p.key}</span> · Created{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </Link>

                    {canEdit && (
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            startEdit(p);
                          }}
                          className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setActionError(null);
                            setDeleteTarget(p);
                          }}
                          className="text-xs text-text-muted hover:text-danger transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project"
        message={
          deleteTarget
            ? `Permanently delete "${deleteTarget.name}"? All issues in this project will be lost. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete project"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
