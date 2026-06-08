import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DeleteAccountDialog({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, submitting, onClose]);

  if (!open || !user) return null;

  const canDelete =
    confirmText.trim().toLowerCase() === user.email.toLowerCase();

  async function handleDelete() {
    if (!canDelete || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await api.delete("/auth/me");
      await logout();
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const response = (
        err as {
          response?: { data?: { message?: string; error?: string } };
        }
      )?.response;
      const msg =
        response?.data?.message ??
        response?.data?.error ??
        "Couldn't delete account. Try again.";
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text">Delete account?</h2>
        <p className="mt-2 text-sm text-text-muted">
          This will permanently delete your account, your memberships, your
          comments, and your issue assignments. Workspaces you own jointly will
          remain with the other owners.
        </p>
        <p className="mt-3 text-sm text-text-muted">
          This action cannot be undone.
        </p>

        <div className="mt-5">
          <label className="block text-xs font-medium text-text-muted mb-1">
            Type <span className="font-semibold text-text">{user.email}</span>{" "}
            to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (error) setError(null);
            }}
            autoFocus
            placeholder={user.email}
            className="w-full px-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-danger"
          />
        </div>

        {error && (
          <div className="mt-4 text-sm text-danger bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-md hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </div>
    </div>
  );
}
