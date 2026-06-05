import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UnverifiedBanner() {
  const { user, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMsg, setResentMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    if (resending) return;
    setErrMsg(null);
    setResentMsg(null);
    setResending(true);
    try {
      await resendVerification(user.email);
      setResentMsg("Code sent — check your inbox");
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
      }, 600);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Could not resend. Try again in a moment.";
      setErrMsg(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-700 shrink-0"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        <p className="text-sm text-amber-900 flex-1 min-w-0">
          {resentMsg ? (
            <span className="font-medium">{resentMsg}</span>
          ) : errMsg ? (
            <span className="font-medium">{errMsg}</span>
          ) : (
            <>
              Your email <span className="font-medium">{user.email}</span> isn't
              verified.
            </>
          )}
        </p>

        {!resentMsg && (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm font-medium text-amber-900 hover:text-amber-950 underline disabled:opacity-50 cursor-pointer shrink-0"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
