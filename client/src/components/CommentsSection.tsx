import { useRef, useState, useCallback } from "react";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "../hooks/useComments";
import { useAuth } from "../contexts/AuthContext";
import { useMyRole } from "../hooks/useMembers";
import Button from "./Button";
import Spinner from "./Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "../hooks/useSocketEvent";
import type { Comment } from "../api/comments";

interface Props {
  issueId: string;
  workspaceId?: string;
}

export default function CommentsSection({ issueId, workspaceId }: Props) {
  const { user } = useAuth();
  const myRole = useMyRole(workspaceId);
  const { data: comments, isLoading } = useComments(issueId);
  const createMutation = useCreateComment(issueId);
  const deleteMutation = useDeleteComment(issueId);

  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const canDeleteAny = myRole === "ADMIN" || myRole === "OWNER";

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

  const handleCommentCreated = useCallback(
    (payload: { comment: Comment; actorId: string }) => {
      if (payload.actorId === user?.id) return;
      if (payload.comment.issueId !== issueId) return;

      queryClient.setQueryData<Comment[]>(["comments", issueId], (old) => {
        if (!old) return [payload.comment];
        if (old.some((c) => c.id === payload.comment.id)) return old;
        return [...old, payload.comment];
      });
    },
    [queryClient, issueId, user?.id],
  );

  const handleCommentDeleted = useCallback(
    (payload: { commentId: string; issueId: string; actorId: string }) => {
      if (payload.actorId === user?.id) return;
      if (payload.issueId !== issueId) return;

      queryClient.setQueryData<Comment[]>(["comments", issueId], (old) => {
        if (!old) return old;
        return old.filter((c) => c.id !== payload.commentId);
      });
    },
    [queryClient, issueId, user?.id],
  );

  useSocketEvent("comment:created", handleCommentCreated);
  useSocketEvent("comment:deleted", handleCommentDeleted);

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
            const canDeleteThis = isAuthor || canDeleteAny;
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
                  <p className="text-sm text-text mt-0.5 whitespace-pre-wrap wrap-break-word">
                    {c.body}
                  </p>
                  {canDeleteThis && (
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="mt-1 text-xs text-danger hover:text-danger transition-colors cursor-pointer"
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
