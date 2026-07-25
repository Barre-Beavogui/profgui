import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, isPasswordHash, verifyPassword } from "./password";

test("hashPassword stores a verifiable non-plaintext password", async () => {
  const password = "Secret123!";
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(isPasswordHash(hash), true);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("verifyPassword accepts legacy plaintext values for migration", async () => {
  assert.equal(await verifyPassword("legacy", "legacy"), true);
  assert.equal(await verifyPassword("wrong", "legacy"), false);
});
