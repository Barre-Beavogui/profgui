import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

interface AuthTokenPayload {
  userId: string;
  exp: number;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function createAuthToken(userId: string, secret: string, now = Date.now()): string {
  const payload: AuthTokenPayload = {
    userId,
    exp: now + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyAuthToken(token: string | undefined, secret: string, now = Date.now()): string | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) {
    return null;
  }

  if (!safeEqual(signature, sign(encodedPayload, secret))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<AuthTokenPayload>;
    if (!payload.userId || typeof payload.exp !== "number" || payload.exp <= now) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}
