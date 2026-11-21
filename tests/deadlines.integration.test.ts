import test from "node:test";
import assert from "node:assert/strict";
import { createTestContext } from "./helpers/test-context.js";

test("Deadlines integration", async (t) => {
  const ctx = await createTestContext(t);

  await t.test("sorts active deadlines chronologically", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);

    // Insert out of order deliberately; API must return them chronologically.
    await ctx.pool.query(
      `INSERT INTO activities (subject_id, title, status, due_at)
       VALUES ($1, $2, $3, $4)`,
      [subjectId, "Later activity", "pending", "2027-06-20T10:00:00Z"],
    );
    await ctx.pool.query(
      `INSERT INTO assessments (subject_id, title, grade, weight, due_at)
       VALUES ($1, $2, NULL, $3, $4)`,
      [subjectId, "Earlier assessment", 2, "2027-06-01T10:00:00Z"],
    );
    await ctx.pool.query(
      `INSERT INTO activities (subject_id, title, status, due_at)
       VALUES ($1, $2, $3, $4)`,
      [subjectId, "Middle activity", "in_progress", "2027-06-10T10:00:00Z"],
    );
    // These should not be shown.
    await ctx.pool.query(
      `INSERT INTO activities (subject_id, title, status, due_at)
       VALUES ($1, $2, $3, $4)`,
      [subjectId, "Completed activity", "completed", "2027-05-01T10:00:00Z"],
    );
    await ctx.pool.query(
      `INSERT INTO assessments (subject_id, title, grade, weight, due_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [subjectId, "Graded assessment", 9.5, 2, "2027-05-02T10:00:00Z"],
    );

    const response = await ctx.app.inject({
      method: "GET",
      url: "/api/v1/deadlines",
      headers: ctx.headers(user.token),
    });
    assert.equal(response.statusCode, 200, response.body);
    const deadlines = response.json() as {
      title: string;
      type: string;
      dueAt: string;
    }[];
    assert.deepEqual(
      deadlines.map((row) => row.title),
      ["Earlier assessment", "Middle activity", "Later activity"],
    );
    assert.deepEqual(
      deadlines.map((row) => row.type),
      ["assessment", "activity", "activity"],
    );
    assert.deepEqual(
      deadlines.map((row) => row.dueAt),
      [
        "2027-06-01T10:00:00.000Z",
        "2027-06-10T10:00:00.000Z",
        "2027-06-20T10:00:00.000Z",
      ],
    );
  });
});
