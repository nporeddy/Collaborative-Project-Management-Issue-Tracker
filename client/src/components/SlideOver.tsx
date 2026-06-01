import { useEffect } from "react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function SlideOver({ open, onClose, children, title }: Props) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/30 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="w-full max-w-xl bg-surface border-l border-border shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-muted">
            {title ?? "Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </aside>
    </div>
  );
}
