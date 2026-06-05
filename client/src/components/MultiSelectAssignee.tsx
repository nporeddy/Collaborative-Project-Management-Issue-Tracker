import { useEffect, useMemo, useRef, useState } from "react";
import type { Member } from "../api/members";

interface Props {
  members: Member[];
  selectedIds: string[];
  includeUnassigned: boolean;
  onChange: (selectedIds: string[], includeUnassigned: boolean) => void;
}

export default function MultiSelectAssignee({
  members,
  selectedIds,
  includeUnassigned,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.user.name.toLowerCase().includes(q) ||
        m.user.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  const toggleMember = (userId: string) => {
    const next = selectedIds.includes(userId)
      ? selectedIds.filter((id) => id !== userId)
      : [...selectedIds, userId];
    onChange(next, includeUnassigned);
  };

  const toggleUnassigned = () => {
    onChange(selectedIds, !includeUnassigned);
  };

  const clearAll = () => {
    onChange([], false);
  };

  const activeCount = selectedIds.length + (includeUnassigned ? 1 : 0);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (open) setSearch("");
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors cursor-pointer ${
          activeCount > 0
            ? "border-primary text-primary bg-primary/5 hover:bg-primary/10"
            : "border-border text-text-muted bg-surface hover:text-text hover:bg-gray-50"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        Assignee
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold bg-primary text-white rounded-full">
            {activeCount}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute z-30 mt-2 w-72 right-0 sm:right-auto sm:left-0 bg-surface border border-border rounded-lg shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="w-full text-sm px-2 py-1.5 border border-border rounded bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {"unassigned".includes(search.trim().toLowerCase()) && (
              <button
                onClick={toggleUnassigned}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    includeUnassigned
                      ? "bg-primary border-primary"
                      : "border-border bg-surface"
                  }`}
                >
                  {includeUnassigned && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="w-6 h-6 shrink-0 rounded-full bg-gray-100 text-text-muted text-xs font-semibold flex items-center justify-center">
                  ∅
                </span>
                <span className="text-text">Unassigned</span>
              </button>
            )}

            {filteredMembers.map((m) => {
              const selected = selectedIds.includes(m.user.id);
              const initial = m.user.name.charAt(0).toUpperCase();
              return (
                <button
                  key={m.user.id}
                  onClick={() => toggleMember(m.user.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      selected
                        ? "bg-primary border-primary"
                        : "border-border bg-surface"
                    }`}
                  >
                    {selected && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="w-6 h-6 shrink-0 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
                    {initial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text truncate">{m.user.name}</p>
                    <p className="text-xs text-text-muted truncate">
                      {m.user.email}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredMembers.length === 0 &&
              !"unassigned".includes(search.trim().toLowerCase()) && (
                <p className="px-3 py-4 text-center text-xs text-text-subtle">
                  No members match "{search}"
                </p>
              )}
          </div>

          {/* Footer */}
          {activeCount > 0 && (
            <div className="p-2 border-t border-border">
              <button
                onClick={clearAll}
                className="w-full text-xs text-text-muted hover:text-text transition-colors py-1 cursor-pointer"
              >
                Clear all ({activeCount} selected)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
