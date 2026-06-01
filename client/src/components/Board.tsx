import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { Issue } from "../api/issues";
import BoardColumn from "./BoardColumn";
import IssueCard from "./IssueCard";

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
  const [draggingId, setDraggingId] = useState<string | null>(null);

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

  const draggingIssue = useMemo(
    () =>
      draggingId ? (issues.find((i) => i.id === draggingId) ?? null) : null,
    [draggingId, issues],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over) return;

    const issueId = String(active.id);
    const targetStatus = String(over.id) as Issue["status"];
    if (!validStatuses.has(targetStatus)) return;

    const issue = issues.find((i) => i.id === issueId);
    if (!issue || issue.status === targetStatus) return;

    onStatusChange(issueId, targetStatus);
  }

  function handleDragCancel() {
    setDraggingId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
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

      <DragOverlay>
        {draggingIssue ? (
          <div className="shadow-lg cursor-grabbing">
            <IssueCard issue={draggingIssue} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
