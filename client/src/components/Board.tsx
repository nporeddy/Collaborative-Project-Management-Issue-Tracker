import { useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Issue } from "../api/issues";
import BoardColumn from "./BoardColumn";

interface Props {
  issues: Issue[];
  onCardClick: (issueId: string) => void;
  onStatusChange: (issueId: string, newStatus: Issue["status"]) => void;
}

const columns: { status: Issue["status"]; title: string }[] = [
  { status: "TODO", title: "To Do" },
  { status: "IN_PROGRESS", title: "In Progress" },
  { status: "IN_REVIEW", title: "In Review" },
  { status: "DONE", title: "Done" },
];

const validStatuses: ReadonlySet<Issue["status"]> = new Set([
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);

export default function Board({ issues, onCardClick, onStatusChange }: Props) {
  const grouped = useMemo(() => {
    const map: Record<Issue["status"], Issue[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    for (const issue of issues) map[issue.status].push(issue);
    return map;
  }, [issues]);

  // Sensors: pointer (mouse/touch) and keyboard (accessibility)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a tiny drag distance so clicks still register as clicks
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const issueId = String(active.id);
    const targetStatus = String(over.id) as Issue["status"];

    if (!validStatuses.has(targetStatus)) return;

    const issue = issues.find((i) => i.id === issueId);
    if (!issue || issue.status === targetStatus) return;

    onStatusChange(issueId, targetStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-4 pb-2 min-h-[500px]"
        style={{ height: "calc(100vh - 320px)" }}
      >
        {columns.map((col) => (
          <BoardColumn
            key={col.status}
            title={col.title}
            status={col.status}
            issues={grouped[col.status]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
