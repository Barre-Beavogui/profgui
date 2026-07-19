import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS/SMTP_PASSWORD must be set.");
  }

  return { host, port, secure, auth: { user, pass } };
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || to;

  await transporter.sendMail({
    from,
    to,
    subject: "Réinitialisation de mot de passe - ProfGui",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bienvenue sur ProfGui.</p>
        <p>Pour définir votre mot de passe, cliquez sur le bouton ci-dessous :</p>
        <p>
          <a href="${resetLink}" style="background:#16a34a;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block">
            Définir mon mot de passe
          </a>
        </p>
        <p>Si le bouton ne fonctionne pas, copiez-collez ce lien :</p>
        <p>${resetLink}</p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTextAsHtml(message: string): string {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => {
      const lines = paragraph
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br>");
      return `<p style="margin:0 0 16px">${lines}</p>`;
    })
    .join("");
}

export async function sendApprovalEmail({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || to;

  await transporter.sendMail({
    from,
    to,
    subject,
    text: message,
    html: `
      <div style="background:#f6f8f7;padding:24px;font-family:Arial,sans-serif;color:#17201b">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dfe7e2;border-radius:12px;overflow:hidden">
          <div style="background:#16a34a;color:#ffffff;padding:20px 24px">
            <h1 style="margin:0;font-size:22px;line-height:1.3">ProfGui</h1>
            <p style="margin:6px 0 0;font-size:14px">Validation de votre compte</p>
          </div>
          <div style="padding:24px;line-height:1.6;font-size:15px">
            ${renderTextAsHtml(message)}
          </div>
          <div style="padding:16px 24px;background:#f0fdf4;color:#365143;font-size:12px">
            Ce message a été envoyé automatiquement par l'administration ProfGui.
          </div>
        </div>
      </div>
    `,
  });
}
