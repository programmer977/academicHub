import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createTestContext } from "./helpers/test-context.js";

test("Subjects integration", async (t) => {
  const ctx = await createTestContext(t);

  await t.test("creates a subject (201) and persists the owner", async () => {
    const user = await ctx.createUser();
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/subjects",
      headers: ctx.headers(user.token),
      payload: { name: `Algorithms-${randomUUID()}`, description: "CS" },
    });
    assert.equal(response.statusCode, 201, response.body);
    const subject = response.json();
    assert.equal(subject.description, "CS");
    const stored = await ctx.pool.query<{ user_id: string }>(
      "SELECT user_id FROM subjects WHERE id = $1",
      [subject.id],
    );
    assert.equal(stored.rows[0]?.user_id, user.id);
  });

  await t.test("rejects empty names (400)", async () => {
    const user = await ctx.createUser();
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/subjects",
      headers: ctx.headers(user.token),
      payload: { name: "   " },
    });
    assert.equal(response.statusCode, 400, response.body);
    const stored = await ctx.pool.query(
      "SELECT id FROM subjects WHERE user_id = $1",
      [user.id],
    );
    assert.equal(stored.rowCount, 0);
  });

  await t.test("lists only the authenticated user's subjects (200)", async () => {
    const owner = await ctx.createUser();
    const stranger = await ctx.createUser();
    const ownId = await ctx.createSubject(owner.id, `A-${randomUUID()}`);
    const foreignId = await ctx.createSubject(stranger.id, `B-${randomUUID()}`);
    const response = await ctx.app.inject({
      method: "GET",
      url: "/api/v1/subjects",
      headers: ctx.headers(owner.token),
    });
    assert.equal(response.statusCode, 200, response.body);
    const ids = (response.json() as { id: string }[]).map((row) => row.id);
    assert.ok(ids.includes(ownId));
    assert.ok(!ids.includes(foreignId));
  });

  await t.test("returns 404 for a nonexistent subject", async () => {
    const user = await ctx.createUser();
    const response = await ctx.app.inject({
      method: "GET",
      url: `/api/v1/subjects/${randomUUID()}`,
      headers: ctx.headers(user.token),
    });
    assert.equal(response.statusCode, 404, response.body);
  });

  await t.test("updates a subject (200) and persists changes", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const response = await ctx.app.inject({
      method: "PATCH",
      url: `/api/v1/subjects/${subjectId}`,
      headers: ctx.headers(user.token),
      payload: { name: "Advanced Algorithms" },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().name, "Advanced Algorithms");
    const stored = await ctx.pool.query<{ name: string }>(
      "SELECT name FROM subjects WHERE id = $1",
      [subjectId],
    );
    assert.equal(stored.rows[0]?.name, "Advanced Algorithms");
  });

  await t.test("deletes a subject (204) and removes the row", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const response = await ctx.app.inject({
      method: "DELETE",
      url: `/api/v1/subjects/${subjectId}`,
      headers: ctx.headers(user.token),
    });
    assert.equal(response.statusCode, 204, response.body);
    const stored = await ctx.pool.query(
      "SELECT id FROM subjects WHERE id = $1",
      [subjectId],
    );
    assert.equal(stored.rowCount, 0);
  });
});
