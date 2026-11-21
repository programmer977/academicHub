import test from "node:test";
import assert from "node:assert/strict";
import { createTestContext } from "./helpers/test-context.js";

const dueAt = "2027-02-15T12:00:00Z";

test("Activities integration", async (t) => {
  const ctx = await createTestContext(t);

  await t.test("creates a valid activity (201)", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/activities",
      headers: ctx.headers(user.token),
      payload: {
        subjectId,
        name: "Prepare final report",
        status: "pending",
        dueAt,
      },
    });
    assert.equal(response.statusCode, 201, response.body);
    const activity = response.json();
    assert.equal(activity.name, "Prepare final report");
    const stored = await ctx.pool.query<{ subject_id: string }>(
      "SELECT subject_id FROM activities WHERE id = $1",
      [activity.id],
    );
    assert.equal(stored.rows[0]?.subject_id, subjectId);
  });

  await t.test("rejects activity for another user's subject (404)", async () => {
    const owner = await ctx.createUser();
    const stranger = await ctx.createUser();
    const subjectId = await ctx.createSubject(owner.id);
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/activities",
      headers: ctx.headers(stranger.token),
      payload: { subjectId, name: "Unauthorized", status: "pending", dueAt },
    });
    assert.equal(response.statusCode, 404, response.body);
    const stored = await ctx.pool.query(
      "SELECT id FROM activities WHERE subject_id = $1",
      [subjectId],
    );
    assert.equal(stored.rowCount, 0);
  });

  await t.test("rejects an invalid activity status (400)", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/activities",
      headers: ctx.headers(user.token),
      payload: { subjectId, name: "Invalid", status: "cancelled", dueAt },
    });
    assert.equal(response.statusCode, 400, response.body);
    const stored = await ctx.pool.query(
      "SELECT id FROM activities WHERE subject_id = $1",
      [subjectId],
    );
    assert.equal(stored.rowCount, 0);
  });
});
