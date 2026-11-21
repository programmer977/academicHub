import test from "node:test";
import assert from "node:assert/strict";
import { createTestContext } from "./helpers/test-context.js";

const dueAt = "2027-03-10T10:00:00Z";

test("Assessments integration", async (t) => {
  const ctx = await createTestContext(t);

  await t.test("rejects grades outside the allowed range (400)", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/assessments",
      headers: ctx.headers(user.token),
      payload: { subjectId, title: "Invalid grade", grade: 11, weight: 2, dueAt },
    });
    assert.equal(response.statusCode, 400, response.body);
    const stored = await ctx.pool.query(
      "SELECT id FROM assessments WHERE subject_id = $1",
      [subjectId],
    );
    assert.equal(stored.rowCount, 0);
  });

  await t.test("rejects invalid assessment weights (400)", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/assessments",
      headers: ctx.headers(user.token),
      payload: { subjectId, title: "Invalid weight", grade: 8, weight: 0, dueAt },
    });
    assert.equal(response.statusCode, 400, response.body);
  });

  // Additional regressions beyond the original 22-case matrix:
  await t.test("returns the created assessment as valid JSON (201)", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const response = await ctx.app.inject({
      method: "POST",
      url: "/api/v1/assessments",
      headers: ctx.headers(user.token),
      payload: { subjectId, title: "First exam", grade: 8.25, weight: 2, dueAt },
    });
    assert.equal(response.statusCode, 201, response.body);
    assert.equal(response.json().grade, 8.25);
    assert.equal(response.json().dueAt, "2027-03-10T10:00:00.000Z");
  });

  await t.test("deletes an assessment (204) and removes the row", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    const inserted = await ctx.pool.query<{ id: string }>(
      `INSERT INTO assessments (subject_id, title, grade, weight, due_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [subjectId, "Fixture exam", 8.5, 2, dueAt],
    );
    const id = inserted.rows[0]?.id;
    assert.ok(id);
    const response = await ctx.app.inject({
      method: "DELETE",
      url: `/api/v1/assessments/${id}`,
      headers: ctx.headers(user.token),
    });
    assert.equal(response.statusCode, 204, response.body);
    const stored = await ctx.pool.query(
      "SELECT id FROM assessments WHERE id = $1",
      [id],
    );
    assert.equal(stored.rowCount, 0);
  });
});
