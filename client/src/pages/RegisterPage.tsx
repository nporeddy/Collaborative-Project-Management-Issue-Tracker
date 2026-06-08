import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import PasswordRequirements from "../components/PasswordRequirements";
import { validatePassword } from "../lib/passwordRules";

export default function RegisterPage() {
  const { register, logout, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !user.emailVerified) {
      logout();
    }
  }, [user, logout]);

  const passwordValid = validatePassword(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError("Password doesn't meet all requirements.");
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password, name);
      navigate(`/verify-email?email=${encodeURIComponent(result.email)}`, {
        replace: true,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-lg font-semibold text-text">Create account</h2>
      <p className="mt-1 text-sm text-text-muted">Get started in seconds.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Your name"
            required
            autoComplete="name"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setPasswordFocused(true)}
            placeholder="Pick a strong password"
            required
            autoComplete="new-password"
          />
          <PasswordRequirements
            password={password}
            show={passwordFocused || password.length > 0}
          />
        </div>

        {error && (
          <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !passwordValid || !name || !email}
          className="w-full"
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-muted text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary hover:text-primary-hover font-medium"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
