import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useIssues,
  useCreateIssue,
  useUpdateAnyIssue,
} from "../hooks/useIssues";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import { useProject } from "../hooks/useProjects";
import SlideOver from "../components/SlideOver";
import IssueDetailPanel from "../components/IssueDetailPanel";
import Board from "../components/Board";
import { useProjectRoom } from "../hooks/useProjectRoom";

const statusTone = {
  TODO: "todo",
  IN_PROGRESS: "progress",
  IN_REVIEW: "review",
  DONE: "done",
} as const;

const priorityTone = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

const statusLabel = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export default function IssuesPage() {
  const { projectId, issueId } = useParams<{
    projectId: string;
    issueId?: string;
  }>();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "board">(() => {
    const saved = localStorage.getItem("issuesView");
    return saved === "board" ? "board" : "list";
  });
  useProjectRoom(projectId); // ← ADD this line

  // Persist on change
  useEffect(() => {
    localStorage.setItem("issuesView", view);
  }, [view]);

  const { data, isLoading, isError } = useIssues(
    projectId!,
    view === "board" ? 200 : 20,
  );
  const { data: project } = useProject(projectId!);
  const createMutation = useCreateIssue(projectId!);
  const [title, setTitle] = useState("");
  const updateMutation = useUpdateAnyIssue(projectId!);

  // Fetch a larger page when the board is showing
  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({ title }, { onSuccess: () => setTitle("") });
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      {project ? (
        <Link
          to={`/workspaces/${project.workspaceId}/projects`}
          className="inline-flex items-center text-sm text-text-muted hover:text-text transition-colors"
        >
          <span className="mr-1">←</span> Back to Projects
        </Link>
      ) : (
        <span className="inline-flex items-center text-sm text-text-subtle">
          <span className="mr-1">←</span> Back to Projects
        </span>
      )}

      {/* Header with view toggle */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            {project ? (
              <>
                <span className="text-text-muted font-normal">
                  {project.name}
                </span>
                <span className="mx-2 text-text-subtle font-normal">·</span>
                Issues
              </>
            ) : (
              "Issues"
            )}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Track work items across the project.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <span className="text-sm text-text-muted">
              {data.total} {data.total === 1 ? "issue" : "issues"}
            </span>
          )}
          <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                view === "list"
                  ? "bg-gray-100 text-text"
                  : "text-text-muted hover:text-text"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                view === "board"
                  ? "bg-gray-100 text-text"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Board
            </button>
          </div>
        </div>
      </div>

      {/* Create form */}
      <Card className="!p-4">
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="What needs to be done?"
          />
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending || !title.trim()}
          >
            {createMutation.isPending ? "Adding…" : "Add issue"}
          </Button>
        </div>
      </Card>

      {/* List or Board */}
      {isLoading ? (
        <Spinner label="Loading issues…" />
      ) : isError ? (
        <Card>
          <p className="text-sm text-danger">Failed to load issues.</p>
        </Card>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Add your first issue above."
        />
      ) : view === "board" ? (
        <Board
          issues={data.items}
          onCardClick={(id) => navigate(`/projects/${projectId}/issues/${id}`)}
          onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
        />
      ) : (
        <Card className="!p-0 divide-y divide-border">
          {data.items.map((issue) => (
            <button
              key={issue.id}
              onClick={() =>
                navigate(`/projects/${projectId}/issues/${issue.id}`)
              }
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
            >
              <Badge tone={statusTone[issue.status]}>
                {statusLabel[issue.status]}
              </Badge>
              <span className="flex-1 text-sm text-text truncate">
                {issue.title}
              </span>
              <Badge tone={priorityTone[issue.priority]}>
                {issue.priority}
              </Badge>
              <span className="text-xs text-text-subtle whitespace-nowrap">
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </Card>
      )}

      {/* Slide-over panel */}
      <SlideOver
        open={!!issueId}
        onClose={() => navigate(`/projects/${projectId}/issues`)}
        title="Issue"
      >
        {issueId && <IssueDetailPanel issueId={issueId} />}
      </SlideOver>
    </div>
  );
}
