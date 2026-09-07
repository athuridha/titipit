import { randomBytes } from "node:crypto";

/**
 * Order codes are shown to customers and typed into the tracking form, so the
 * alphabet drops characters that get confused by hand (0/O, 1/I, 5/S).
 */
const ALPHABET = "ABCDEFGHJKLMNPQRTUVWXY2346789";

export function generateOrderCode() {
  const bytes = randomBytes(6);
  let body = "";
  for (const byte of bytes) {
    body += ALPHABET[byte % ALPHABET.length];
  }
  return `TTP-${body}`;
}

export function normalizeOrderCode(input: string) {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");
  return cleaned.startsWith("TTP-") ? cleaned : `TTP-${cleaned}`;
}
