type Rule = {
  label: string;
  test: (pw: string) => boolean;
};

export const PASSWORD_RULES: Rule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "At least one number", test: (pw) => /\d/.test(pw) },
  { label: "At least one letter", test: (pw) => /[a-zA-Z]/.test(pw) },
];

export function validatePassword(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw));
}
