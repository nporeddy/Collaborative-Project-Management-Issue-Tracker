import { PASSWORD_RULES } from "../lib/passwordRules";

export default function PasswordRequirements({
  password,
  show,
}: {
  password: string;
  show: boolean;
}) {
  if (!show) return null;

  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs ${
              passed ? "text-success" : "text-text-muted"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              {passed ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <circle cx="12" cy="12" r="9" />
              )}
            </svg>
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
