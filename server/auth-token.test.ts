import assert from "node:assert/strict";
import test from "node:test";
import { createAuthToken, verifyAuthToken } from "./auth-token";

test("auth token round-trips for the signed user", () => {
  const token = createAuthToken("user-1", "secret", 1_000);

  assert.equal(verifyAuthToken(token, "secret", 2_000), "user-1");
});

test("auth token rejects tampering and expiration", () => {
  const token = createAuthToken("user-1", "secret", 1_000);
  const [payload, signature] = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ userId: "user-2", exp: 999_999 })).toString("base64url");

  assert.equal(verifyAuthToken(`${tamperedPayload}.${signature}`, "secret", 2_000), null);
  assert.equal(verifyAuthToken(token, "wrong-secret", 2_000), null);
  assert.equal(verifyAuthToken(token, "secret", 24 * 60 * 60 * 1000 + 1_001), null);
  assert.equal(verifyAuthToken(payload, "secret", 2_000), null);
});
