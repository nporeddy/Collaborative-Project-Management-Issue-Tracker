import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useWorkspaces,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from "../hooks/useWorkspaces";
import { useMyRoles } from "../hooks/useMembers";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import ConfirmDialog from "../components/ConfirmDialog";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export default function WorkspacesPage() {
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const { data: roleMap } = useMyRoles();
  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate(name, { onSuccess: () => setName("") });
  };

  const startEdit = (ws: Workspace) => {
    setActionError(null);
    setEditingId(ws.id);
    setEditingName(ws.name);
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
              ?.data?.error ?? "Failed to rename workspace.";
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
            ?.error ?? "Failed to delete workspace.";
        setActionError(msg);
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Action error (rename/delete) */}
      {actionError && (
        <Card className="!p-3 !bg-red-50 !border-red-200">
          <p className="text-sm text-danger">{actionError}</p>
        </Card>
      )}

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
          {workspaces.map((ws: Workspace) => {
            const role = roleMap?.[ws.id];
            const canRename = role === "ADMIN" || role === "OWNER";
            const canDelete = role === "OWNER";
            const isEditing = editingId === ws.id;

            return (
              <Card key={ws.id} className="h-full">
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
                      to={`/workspaces/${ws.id}/projects`}
                      className="flex-1 min-w-0 group"
                    >
                      <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors truncate">
                        {ws.name}
                      </h3>
                      <p className="mt-1 text-xs text-text-muted">
                        Created {new Date(ws.createdAt).toLocaleDateString()}
                      </p>
                    </Link>

                    {(canRename || canDelete) && (
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {canRename && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              startEdit(ws);
                            }}
                            className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
                          >
                            Rename
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setActionError(null);
                              setDeleteTarget(ws);
                            }}
                            className="text-xs text-text-muted hover:text-danger transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete workspace"
        message={
          deleteTarget
            ? `Permanently delete "${deleteTarget.name}"? All projects and issues in this workspace will be lost. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete workspace"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
