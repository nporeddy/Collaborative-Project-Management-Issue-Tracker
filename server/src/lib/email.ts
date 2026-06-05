import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

if (!apiKey) {
  console.warn(
    "[email] RESEND_API_KEY not set — email sending will fail at runtime",
  );
}

const resend = apiKey ? new Resend(apiKey) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<{ id: string }> {
  if (!resend) {
    throw new Error("Email is not configured. Set RESEND_API_KEY in .env.");
  }

  const result = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  if (result.error) {
    throw new Error(`Email send failed: ${result.error.message}`);
  }

  if (!result.data) {
    throw new Error("Email send returned no data");
  }

  return { id: result.data.id };
}
