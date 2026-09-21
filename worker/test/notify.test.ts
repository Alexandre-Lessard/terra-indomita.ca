import { describe, expect, it } from "vitest";
import { buildNoticeMessage, formatLocalDateTime } from "../src/lib/notify";

const notice = {
  eventTitle: "Stage d'autonomie en forêt",
  eventStart: "2026-10-10T09:00:00",
  name: "Participante Fictive",
  email: "participante@example.com",
  phone: "",
};

function decodeBody(raw: string): string {
  const body = raw.split("\r\n\r\n").slice(1).join("").replace(/\r\n/g, "");
  const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

describe("registration notice", () => {
  it("formats local dates without shifting the timezone", () => {
    expect(formatLocalDateTime("2026-10-10T09:00:00")).toMatch(/^10 octobre 2026.*09 h 00$/);
  });

  it("builds a UTF-8 message that replies to the participant", () => {
    const raw = buildNoticeMessage(notice, "inscriptions@terra-indomita.ca", "admin@example.com");
    expect(raw).toContain("From: Terra Indomita <inscriptions@terra-indomita.ca>");
    expect(raw).toContain("Reply-To: <participante@example.com>");
    expect(raw).toMatch(/Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=/);
    for (const line of raw.split("\r\n\r\n")[0].split("\r\n")) {
      expect(line.length).toBeLessThanOrEqual(78);
    }

    const body = decodeBody(raw);
    expect(body).toContain("Événement : Stage d'autonomie en forêt");
    expect(body).toContain("Téléphone : non fourni");
  });
});
