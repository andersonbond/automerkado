import nodemailer from "nodemailer";

type BidMailPayload = {
  to: string;
  carTitle: string;
  amountLabel: string;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendBidConfirmationEmail(payload: BidMailPayload) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const transport = getTransport();

  if (!transport || !from) {
    console.warn(
      "[mail] SMTP not configured; skipping bid confirmation for",
      payload.to,
    );
    return;
  }

  await transport.sendMail({
    from,
    to: payload.to,
    subject: `Automerkado — bid received on ${payload.carTitle}`,
    text: `Your bid of ${payload.amountLabel} on "${payload.carTitle}" was recorded successfully.`,
    html: `<p>Your bid of <strong>${payload.amountLabel}</strong> on <strong>${escapeHtml(payload.carTitle)}</strong> was recorded successfully.</p>`,
  });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
