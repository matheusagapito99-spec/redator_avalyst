import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

function key(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) throw new Error("APP_ENCRYPTION_KEY ausente.");
  // Deriva 32 bytes a partir do segredo (independente do formato).
  return createHash("sha256").update(raw).digest();
}

/** Criptografa um segredo (AES-256-GCM). Retorna base64 de iv|tag|ciphertext. */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(b64: string): string {
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Últimos 4 caracteres para exibição mascarada (a chave nunca volta inteira ao client). */
export function keyHint(plain: string): string {
  const tail = plain.slice(-4);
  return `••••${tail}`;
}
