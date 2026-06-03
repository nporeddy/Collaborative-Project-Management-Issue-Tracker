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

const typeIndicator = {
  STORY: { label: "S", cls: "bg-indigo-100 text-indigo-700" },
  BUG: { label: "B", cls: "bg-red-100 text-red-700" },
  TASK: { label: "T", cls: "bg-slate-100 text-slate-600" },
} as const;

export default function IssueCard({ issue, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: issue.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    ...(isDragging ? { transform: "none" } : {}),
  };

  const type = typeIndicator[issue.type] ?? typeIndicator.TASK;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="w-full text-left bg-surface border border-border rounded-md px-3 py-2 hover:border-border-strong hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <span
          className={`shrink-0 w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${type.cls}`}
          title={`Type: ${issue.type}`}
        >
          {type.label}
        </span>
        <p className="text-sm text-text leading-snug line-clamp-2 flex-1">
          {issue.title}
        </p>
      </div>
      <div className="mt-1.5 ml-7 flex items-center gap-2">
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
