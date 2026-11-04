import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";

const BCRYPT_ROUNDS = 12;
const BCRYPT_PREFIX = /^\$2[aby]\$\d{2}\$/;

export function isHashed(stored: string): boolean {
  return BCRYPT_PREFIX.test(stored);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Vérifie un mot de passe. Accepte aussi les anciens mots de passe stockés en clair
 * (avant la migration) : `needsRehash` indique alors qu'il faut les re-hacher.
 */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (isHashed(stored)) {
    return { ok: await bcrypt.compare(plain, stored), needsRehash: false };
  }
  const a = Buffer.from(plain);
  const b = Buffer.from(stored);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, needsRehash: ok };
}
