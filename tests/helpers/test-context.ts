import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { TestContext } from "node:test";
import { Pool } from "pg";
import { buildApp } from "../../src/app.js";

export type TestUser = {
  id: string;
  email: string;
  token: string;
};
export async function createTestContext(t: TestContext) {
  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("TEST_DATABASE_URL is required");
  }

  const parsedUrl = new URL(databaseUrl);
  if (decodeURIComponent(parsedUrl.pathname) !== "/academichub_test") {
    throw new Error("Refusing tests outside the academichub_test database");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const app = buildApp({
    pool,
    jwtSecret: "integration-test-secret-with-at-least-32-characters",
  });
  const userIds: string[] = [];

  t.after(async () => {
    try {
      if (userIds.length > 0) {
        await pool.query(
          "DELETE FROM users WHERE id = ANY($1::uuid[])",
          [userIds],
        );
      }
    } finally {
      try {
        await app.close();
      } finally {
        await pool.end();
      }
    }
  });
  const database = await pool.query<{ name: string }>(
    "SELECT current_database() AS name",
  );
  assert.equal(database.rows[0]?.name, "academichub_test");
  await app.ready();
  async function createUser(): Promise<TestUser> {
    const email = `fixture-${randomUUID()}@example.com`;
    const result = await pool.query<{ id: string }>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id`,
      ["Integration Fixture", email, "not-used-for-login"],
    );
    const id = result.rows[0]?.id;
    assert.ok(id, "Expected a generated user ID");
    userIds.push(id);
    return {
      id,
      email,
      token: app.jwt.sign({ sub: id, role: "user" }),
    };
  }
  async function createSubject(userId: string, name = `Subject-${randomUUID()}`) {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO subjects (user_id, name)
       VALUES ($1, $2) RETURNING id`,
      [userId, name],
    );
    const id = result.rows[0]?.id;
    assert.ok(id, "Expected a generated subject ID");
    return id;
  }

  function headers(token: string) {
    return { authorization: `Bearer ${token}` };
  }

  return { app, pool, createUser, createSubject, headers };
}
