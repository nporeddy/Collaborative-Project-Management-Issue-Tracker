import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Issue } from "../api/issues";

interface Props {
  issue: Issue;
  onClick: () => void;
}

const priorityDot = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-amber-500",
  URGENT: "bg-red-500",
} as const;

export default function IssueCard({ issue, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: issue.id,
    });

  const style = {
  transform: CSS.Translate.toString(transform),
  opacity: isDragging ? 0.3 : 1,
  // Don't actually move the original — the overlay handles visual movement
  ...(isDragging ? { transform: 'none' } : {}),
};

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="w-full text-left bg-surface border border-border rounded-md px-3 py-2 hover:border-border-strong hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing"
    >
      <p className="text-sm text-text leading-snug line-clamp-2">
        {issue.title}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${priorityDot[issue.priority]}`}
          title={`Priority: ${issue.priority}`}
        />
        <span className="text-[11px] text-text-subtle">
          {new Date(issue.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </button>
  );
}
