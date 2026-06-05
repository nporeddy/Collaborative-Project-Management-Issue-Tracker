import { useRef, useState } from "react";
import { useIssue, useUpdateIssue, useDeleteIssue } from "../hooks/useIssues";
import Badge from "./Badge";
import Spinner from "./Spinner";
import CommentsSection from "./CommentsSection";
import ConfirmDialog from "./ConfirmDialog";
import { useMembers, useMyRole } from "../hooks/useMembers";

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
] as const;

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const;

const statusTone = {
  TODO: "todo",
  IN_PROGRESS: "progress",
  IN_REVIEW: "review",
  DONE: "done",
} as const;

const typeOptions = [
  { value: "STORY", label: "Story" },
  { value: "BUG", label: "Bug" },
  { value: "TASK", label: "Task" },
] as const;

interface Props {
  issueId: string;
  onIssueDeleted?: () => void;
}

export default function IssueDetailPanel({ issueId, onIssueDeleted }: Props) {
  const { data: issue, isLoading, isError } = useIssue(issueId);
  const workspaceId = issue?.project?.workspaceId;
  const { data: members } = useMembers(workspaceId);
  const myRole = useMyRole(workspaceId);
  const updateMutation = useUpdateIssue(issueId);
  const deleteMutation = useDeleteIssue(issue?.projectId ?? "");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  if (isLoading) {
    return (
      <div className="p-6">
        <Spinner label="Loading issue…" />
      </div>
    );
  }

  if (isError || !issue) {
    return <div className="p-6 text-sm text-danger">Failed to load issue.</div>;
  }

  const canDelete = myRole === "ADMIN" || myRole === "OWNER";

  const handleTitleBlur = () => {
    const newTitle = titleRef.current?.value.trim();
    if (newTitle && newTitle !== issue.title) {
      updateMutation.mutate({ title: newTitle });
    }
  };

  const handleDescriptionBlur = () => {
    const newDesc = descriptionRef.current?.value ?? "";
    if (newDesc !== (issue.description ?? "")) {
      updateMutation.mutate({ description: newDesc });
    }
  };

  const confirmDelete = () => {
    deleteMutation.mutate(issue.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onIssueDeleted?.();
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? "Failed to delete issue.";
        setDeleteError(msg);
        setDeleteOpen(false);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <input
        key={`title-${issue.id}`}
        ref={titleRef}
        defaultValue={issue.title}
        onBlur={handleTitleBlur}
        className="w-full text-xl font-semibold text-text bg-transparent border-0 focus:outline-none focus:ring-0 px-0"
        placeholder="Issue title"
      />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Type
          </label>
          <select
            value={issue.type}
            onChange={(e) =>
              updateMutation.mutate({
                type: e.target.value as typeof issue.type,
              })
            }
            className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Status
          </label>
          <select
            value={issue.status}
            onChange={(e) =>
              updateMutation.mutate({
                status: e.target.value as typeof issue.status,
              })
            }
            className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Priority
          </label>
          <select
            value={issue.priority}
            onChange={(e) =>
              updateMutation.mutate({
                priority: e.target.value as typeof issue.priority,
              })
            }
            className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Assignee
          </label>
          <select
            value={issue.assigneeId ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              updateMutation.mutate({
                assigneeId: value === "" ? null : value,
              });
            }}
            className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Unassigned</option>
            {members?.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Description
        </label>
        <textarea
          key={`desc-${issue.id}`}
          ref={descriptionRef}
          defaultValue={issue.description ?? ""}
          onBlur={handleDescriptionBlur}
          placeholder="Add a description…"
          rows={5}
          className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="text-xs text-text-muted space-y-1 pt-4 border-t border-border">
        <p>
          Status: <Badge tone={statusTone[issue.status]}>{issue.status}</Badge>
        </p>
        <p>Created {new Date(issue.createdAt).toLocaleString()}</p>
        {updateMutation.isPending && <p className="text-primary">Saving…</p>}
      </div>

      <div className="pt-4 border-t border-border">
        <CommentsSection issueId={issue.id} workspaceId={workspaceId} />
      </div>

      {/* Delete error */}
      {deleteError && (
        <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {deleteError}
        </div>
      )}

      {/* Danger zone — admin+ only */}
      {canDelete && (
        <div className="pt-4 border-t border-border">
          <button
            onClick={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
            className="text-xs text-danger hover:text-danger transition-colors cursor-pointer"
          >
            Delete issue
          </button>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete issue"
        message={`Permanently delete "${issue.title}"? This cannot be undone.`}
        confirmLabel="Delete issue"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
