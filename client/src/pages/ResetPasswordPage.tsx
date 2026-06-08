import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import PasswordRequirements from "../components/PasswordRequirements";
import { validatePassword } from "../lib/passwordRules";
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  function handleCodeChange(idx: number, value: string) {
    setError(null);
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i] ?? "";
    setCode(next);
    const lastIdx = Math.min(text.length, 6) - 1;
    inputRefs.current[lastIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Enter all 6 digits of your reset code.");
      return;
    }
    if (!validatePassword(newPassword)) {
      setError("New password doesn't meet all requirements.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        code: fullCode,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-border rounded-lg p-8 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-text mb-2">
              Password reset
            </h1>
            <p className="text-sm text-text-muted">
              Redirecting you to sign in…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-text mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-text-muted mb-6">
            Enter the 6-digit code we sent to <strong>{email}</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Reset code
              </label>
              <div className="flex gap-2 justify-between">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-text mb-1"
              >
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                required
                placeholder="Pick a strong password"
                className="w-full px-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <PasswordRequirements
                password={newPassword}
                show={newPassword.length > 0}
              />
            </div>

            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Resetting…" : "Reset password"}
            </button>
          </form>

          <div className="mt-6 text-sm text-text-muted text-center space-y-1">
            <p>
              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary-hover"
              >
                Didn't get a code? Try again
              </Link>
            </p>
            <p>
              <Link
                to="/login"
                className="text-primary hover:text-primary-hover"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
