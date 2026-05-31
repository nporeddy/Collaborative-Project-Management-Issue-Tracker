import type { Issue } from "../api/issues";
import Badge from "./Badge";

interface Props {
  issue: Issue;
  onClick: () => void;
}

const priorityTone = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export default function IssueCard({ issue, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface border border-border rounded-md p-3 hover:border-border-strong hover:shadow-sm transition-all cursor-pointer space-y-2"
    >
      <p className="text-sm text-text leading-snug line-clamp-2">
        {issue.title}
      </p>
      <div className="flex items-center justify-between">
        <Badge tone={priorityTone[issue.priority]}>{issue.priority}</Badge>
        <span className="text-xs text-text-subtle">
          {new Date(issue.createdAt).toLocaleDateString()}
        </span>
      </div>
    </button>
  );
}
