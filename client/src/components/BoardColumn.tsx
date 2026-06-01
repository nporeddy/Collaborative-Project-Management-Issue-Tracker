import { useDroppable } from "@dnd-kit/core";
import type { Issue } from "../api/issues";
import IssueCard from "./IssueCard";

interface Props {
  title: string;
  status: Issue["status"];
  issues: Issue[];
  onCardClick: (issueId: string) => void;
}

const statusAccent = {
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-amber-500",
  DONE: "bg-emerald-500",
} as const;

export default function BoardColumn({
  title,
  status,
  issues,
  onCardClick,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col border rounded-lg flex-1 min-w-0 h-full transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-gray-50"
      }`}
    >
      <div className="px-3 py-3 flex items-center gap-2 border-b border-border">
        <span className={`w-2 h-2 rounded-full ${statusAccent[status]}`} />
        <h3 className="text-xs font-semibold text-text uppercase tracking-wide">
          {title}
        </h3>
        <span className="ml-auto text-xs text-text-muted">{issues.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {issues.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-subtle">
            No issues
          </div>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onCardClick(issue.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
