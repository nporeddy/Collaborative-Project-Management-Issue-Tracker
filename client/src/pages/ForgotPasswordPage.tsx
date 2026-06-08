import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-text mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-text-muted mb-6">
            Enter your email and we'll send you a reset code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                required
                autoFocus
                className="w-full px-3 py-2 border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !email}
              className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Sending…" : "Send reset code"}
            </button>
          </form>

          <div className="mt-6 text-sm text-text-muted text-center">
            <Link to="/login" className="text-primary hover:text-primary-hover">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
