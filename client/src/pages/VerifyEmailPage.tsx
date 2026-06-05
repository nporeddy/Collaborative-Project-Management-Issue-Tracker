import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resentNotice, setResentNotice] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!resentNotice) return;
    const t = setTimeout(() => setResentNotice(false), 3000);
    return () => clearTimeout(t);
  }, [resentNotice]);

  if (!email) {
    return (
      <AuthLayout>
        <h2 className="text-lg font-semibold text-text">No email provided</h2>
        <p className="mt-1 text-sm text-text-muted">
          We need to know which account to verify.
        </p>
        <Link
          to="/register"
          className="mt-6 inline-block text-sm text-primary hover:text-primary-hover font-medium"
        >
          ← Back to sign up
        </Link>
      </AuthLayout>
    );
  }

  const code = digits.join("");
  const isComplete = code.length === 6 && /^\d{6}$/.test(code);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned === "") {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      if (error) setError(null);
      return;
    }

    const chars = cleaned.split("");
    const next = [...digits];
    let cursor = index;
    for (const ch of chars) {
      if (cursor >= 6) break;
      next[cursor] = ch;
      cursor++;
    }
    setDigits(next);
    if (error) setError(null);

    const nextFocusIndex = Math.min(cursor, 5);
    focusInput(nextFocusIndex);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusInput(index + 1);
    } else if (e.key === "Enter" && isComplete) {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    if (!isComplete || verifying) return;
    setError(null);
    setVerifying(true);
    try {
      await verifyEmail(email, code);
      navigate("/workspaces", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Verification failed. Please try again.";
      setError(msg);
      setVerifying(false);
      // Clear the code so user can re-enter
      setDigits(["", "", "", "", "", ""]);
      focusInput(0);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResending(true);
    try {
      await resendVerification(email);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setResentNotice(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to resend. Please try again.";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-lg font-semibold text-text">Verify your email</h2>
      <p className="mt-1 text-sm text-text-muted">
        Enter the 6-digit code we sent to{" "}
        <span className="font-medium text-text">{email}</span>.
      </p>

      <div className="mt-6">
        <label className="block text-xs font-medium text-text-muted mb-2">
          Verification code
        </label>
        <div className="flex gap-2 justify-between">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.currentTarget.select()}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoFocus={i === 0}
              className="w-12 h-14 text-center text-xl font-semibold text-text border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm text-danger bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {resentNotice && (
        <div className="mt-4 text-sm text-text bg-green-50 border border-green-100 rounded-md px-3 py-2">
          A new code has been sent. Check your inbox.
        </div>
      )}

      <Button
        onClick={handleVerify}
        disabled={!isComplete || verifying}
        className="w-full mt-6"
      >
        {verifying ? "Verifying…" : "Verify email"}
      </Button>

      <div className="mt-6 text-center text-sm text-text-muted">
        Didn't receive the code?{" "}
        {resendCooldown > 0 ? (
          <span className="text-text-subtle">Resend in {resendCooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-primary hover:text-primary-hover font-medium cursor-pointer disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-text-muted text-center">
        Wrong email?{" "}
        <Link
          to="/register"
          className="text-primary hover:text-primary-hover font-medium"
        >
          Start over
        </Link>
      </p>
    </AuthLayout>
  );
}
