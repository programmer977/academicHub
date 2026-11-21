import test from "node:test";
import assert from "node:assert/strict";
import { createTestContext } from "./helpers/test-context.js";

test("Grades integration", async (t) => {
  const ctx = await createTestContext(t);

  await t.test("calculates weighted average from persisted grades (7.83)", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    for (const [grade, weight] of [[7, 2], [8, 3], [9, 1]]) {
      await ctx.pool.query(
        `INSERT INTO assessments (subject_id, title, grade, weight, due_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [subjectId, `Exam ${grade}`, grade, weight, "2027-03-10T10:00:00Z"],
      );
    }
    const response = await ctx.app.inject({
      method: "GET",
      url: `/api/v1/subjects/${subjectId}/average`,
      headers: ctx.headers(user.token),
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json(), 7.83);
  });

  await t.test("returns JSON null when there are no grades (200)", async () => {
    const user = await ctx.createUser();
    const subjectId = await ctx.createSubject(user.id);
    // A real subject with an ungraded assessment must return null, not 404.
    await ctx.pool.query(
      `INSERT INTO assessments (subject_id, title, grade, weight, due_at)
       VALUES ($1, $2, NULL, $3, $4)`,
      [subjectId, "Pending exam", 3, "2027-03-10T10:00:00Z"],
    );
    const response = await ctx.app.inject({
      method: "GET",
      url: `/api/v1/subjects/${subjectId}/average`,
      headers: ctx.headers(user.token),
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json(), null);
  });
});
