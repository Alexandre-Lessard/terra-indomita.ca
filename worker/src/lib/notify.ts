import { EmailMessage } from "cloudflare:email";

export interface RegistrationNotice {
  eventTitle: string;
  eventStart: string;
  name: string;
  email: string;
  phone: string;
}

/** "2026-08-15T09:00:00" → "15 août 2026, 09 h 00", without any timezone shift. */
export function formatLocalDateTime(local: string): string {
  const [datePart, timePart = "00:00:00"] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, h, mi));
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "UTC",
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

// RFC 2047: non-ASCII headers become encoded words of at most 75 characters,
// so long values are split on character boundaries and folded.
function encodeHeader(value: string): string {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  const words: string[] = [];
  let chunk = "";
  for (const char of value) {
    if (new TextEncoder().encode(chunk + char).length > 39) {
      words.push(chunk);
      chunk = "";
    }
    chunk += char;
  }
  if (chunk) words.push(chunk);
  return words.map((w) => `=?UTF-8?B?${toBase64(w)}?=`).join("\r\n ");
}

function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function buildNoticeMessage(notice: RegistrationNotice, from: string, to: string): string {
  const subject = `Nouvelle inscription : ${notice.eventTitle}`;
  const body = [
    "Une nouvelle inscription vient d'être reçue sur terra-indomita.ca.",
    "",
    `Événement : ${notice.eventTitle}`,
    `Date : ${formatLocalDateTime(notice.eventStart)}`,
    "",
    `Nom : ${notice.name}`,
    `Courriel : ${notice.email}`,
    `Téléphone : ${notice.phone || "non fourni"}`,
    "",
    "Répondre à ce courriel écrit directement à la personne inscrite.",
    "La liste complète des inscriptions est dans l'administration du site.",
  ].join("\r\n");

  const encodedBody = toBase64(body).replace(/.{1,76}/g, "$&\r\n");

  return [
    `From: ${encodeHeader("Terra Indomita")} <${from}>`,
    `To: <${to}>`,
    `Reply-To: <${notice.email}>`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@terra-indomita.ca>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n");
}

/**
 * Sends the notice through Email Routing to the verified address bound to
 * EMAIL, which is free and needs no sending domain onboarding.
 */
export async function sendRegistrationNotice(env: Env, notice: RegistrationNotice): Promise<void> {
  const raw = buildNoticeMessage(notice, env.NOTIFY_FROM, env.NOTIFY_TO);
  await env.EMAIL.send(new EmailMessage(env.NOTIFY_FROM, env.NOTIFY_TO, raw));
}
