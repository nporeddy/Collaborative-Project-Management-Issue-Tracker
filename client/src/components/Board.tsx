import { useMemo } from "react";
import type { Issue } from "../api/issues";
import BoardColumn from "./BoardColumn";

interface Props {
  issues: Issue[];
  onCardClick: (issueId: string) => void;
}

const columns: { status: Issue["status"]; title: string }[] = [
  { status: "TODO", title: "To Do" },
  { status: "IN_PROGRESS", title: "In Progress" },
  { status: "IN_REVIEW", title: "In Review" },
  { status: "DONE", title: "Done" },
];

export default function Board({ issues, onCardClick }: Props) {
  // Group once per render
  const grouped = useMemo(() => {
    const map: Record<Issue["status"], Issue[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    for (const issue of issues) {
      map[issue.status].push(issue);
    }
    return map;
  }, [issues]);

  return (
    <div
      className="flex gap-4 pb-2 min-h-[500px]"
      style={{ height: "calc(100vh - 320px)" }}
    >
      {" "}
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
  );
}
