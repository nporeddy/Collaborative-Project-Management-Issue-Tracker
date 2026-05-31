import { useRef, useState } from "react";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "../hooks/useComments";
import { useAuth } from "../contexts/AuthContext";
import Button from "./Button";
import Spinner from "./Spinner";

interface Props {
  issueId: string;
}

export default function CommentsSection({ issueId }: Props) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(issueId);
  const createMutation = useCreateComment(issueId);
  const deleteMutation = useDeleteComment(issueId);

  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = () => {
    const body = draft.trim();
    if (!body) return;
    createMutation.mutate(body, {
      onSuccess: () => {
        setDraft("");
        textareaRef.current?.focus();
      },
    });
  };

  const initial = (name?: string) => name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-text">
        Comments{" "}
        {comments && (
          <span className="text-text-muted font-normal">
            ({comments.length})
          </span>
        )}
      </p>

      {/* Existing comments */}
      {isLoading ? (
        <Spinner label="Loading comments…" />
      ) : !comments || comments.length === 0 ? (
        <p className="text-xs text-text-muted">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const isAuthor = user?.id === c.authorId;
            return (
              <li key={c.id} className="flex gap-3">
                <span className="w-8 h-8 shrink-0 rounded-full bg-gray-100 text-text-muted text-xs font-semibold flex items-center justify-center">
                  {initial(c.author?.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-text">
                      {c.author?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-text-subtle">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-text mt-0.5 whitespace-pre-wrap break-words">
                    {c.body}
                  </p>
                  {isAuthor && (
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="mt-1 text-xs text-text-muted hover:text-danger transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* New comment form */}
      <div className="pt-4 border-t border-border">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment…"
          rows={3}
          className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={handlePost}
            disabled={!draft.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
