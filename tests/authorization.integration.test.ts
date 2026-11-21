import test from "node:test";
import assert from "node:assert/strict";
import { createTestContext } from "./helpers/test-context.js";

test("Authorization integration", async (t) => {
  const ctx = await createTestContext(t);

  await t.test("prevents reading another user's subject (404)", async () => {
    const owner = await ctx.createUser();
    const stranger = await ctx.createUser();
    const id = await ctx.createSubject(owner.id, "Owner-only subject");

    const forbidden = await ctx.app.inject({
      method: "GET",
      url: `/api/v1/subjects/${id}`,
      headers: ctx.headers(stranger.token),
    });
    assert.equal(forbidden.statusCode, 404, forbidden.body);

    // A 404 is meaningful only when the resource really exists for its owner.
    const allowed = await ctx.app.inject({
      method: "GET",
      url: `/api/v1/subjects/${id}`,
      headers: ctx.headers(owner.token),
    });
    assert.equal(allowed.statusCode, 200, allowed.body);
  });

  await t.test("prevents modifying another user's subject (404)", async () => {
    const owner = await ctx.createUser();
    const stranger = await ctx.createUser();
    const id = await ctx.createSubject(owner.id, "Original title");

    const response = await ctx.app.inject({
      method: "PATCH",
      url: `/api/v1/subjects/${id}`,
      headers: ctx.headers(stranger.token),
      payload: { name: "Stolen subject" },
    });
    assert.equal(response.statusCode, 404, response.body);

    const stored = await ctx.pool.query<{ name: string; user_id: string }>(
      "SELECT name, user_id FROM subjects WHERE id = $1",
      [id],
    );
    assert.equal(stored.rows[0]?.name, "Original title");
    assert.equal(stored.rows[0]?.user_id, owner.id);
  });
});
