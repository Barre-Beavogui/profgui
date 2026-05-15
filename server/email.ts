import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set.");
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
