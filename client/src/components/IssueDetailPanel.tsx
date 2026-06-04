import { useRef } from "react";
import { useIssue, useUpdateIssue } from "../hooks/useIssues";
import Badge from "./Badge";
import Spinner from "./Spinner";
import CommentsSection from "./CommentsSection";
import { useMembers } from "../hooks/useMembers";

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
}

export default function IssueDetailPanel({ issueId }: Props) {
  const { data: issue, isLoading, isError } = useIssue(issueId);
  const workspaceId = issue?.project?.workspaceId;
  const { data: members } = useMembers(workspaceId);
  const updateMutation = useUpdateIssue(issueId);

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
        <CommentsSection issueId={issue.id} />
      </div>
    </div>
  );
}
