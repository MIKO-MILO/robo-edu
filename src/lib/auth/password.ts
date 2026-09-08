import "server-only";

import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

export async function verifyPassword(password: string, storedPassword: string) {
  const [scheme, salt, storedHash] = storedPassword.split("$");
  if (scheme !== "scrypt" || !salt || !storedHash) {
    const input = Buffer.from(password);
    const stored = Buffer.from(storedPassword);
    return input.length === stored.length && crypto.timingSafeEqual(input, stored);
  }

  const derived = Buffer.from((await scrypt(password, salt, 64)) as Uint8Array);
  const expected = Buffer.from(storedHash, "hex");
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = Buffer.from((await scrypt(password, salt, 64)) as Uint8Array).toString("hex");
  return `scrypt$${salt}$${hash}`;
}
