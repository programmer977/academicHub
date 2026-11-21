import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { Pool } from "pg";
import { buildApp } from "../src/app.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
    throw new Error(
        "TEST_DATABASE_URL is required"
    );
}
const databaseName = decodeURIComponent(
    new URL(databaseUrl).pathname.slice(1)
);
if (databaseName !== "academichub_test") {
    throw new Error(
        "Tests must use academichub_test"
    );
}
test("Auth integration tests", async (t) => {
    const pool = new Pool({
        connectionString: databaseUrl
    });
    const app = buildApp({
        pool,
        jwtSecret:
            "integration-test-secret-with-at-least-32-characters"
    });
    const createdEmails: string[] = [];
    t.after(async () => {
        try {
            for (const email of createdEmails) {
                await pool.query(
                    "DELETE FROM users WHERE email = $1",
                    [email]
                );
            }
        } finally {
            await app.close();
            await pool.end();
        }
    });
    const databaseResult = await pool.query(
        "SELECT current_database() AS name"
    );
    assert.equal(
        databaseResult.rows[0].name,
        "academichub_test"
    );
    await app.ready();
    async function registerUser(email: string) {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",

            payload: {
                name: "Integration Test",
                email,
                password: "TestPassword123456"
            }
        });
        if (response.statusCode === 201) {
            createdEmails.push(email);
        }

        return response;
    }
    await t.test(
        "registers and authenticates a user",
        async () => {

            const email =
                `test-${randomUUID()}@example.com`;

            const registerResponse =
                await registerUser(email);

            assert.equal(
                registerResponse.statusCode,
                201
            );
            const loginResponse = await app.inject({
                method: "POST",
                url: "/api/v1/auth/login",

                payload: {
                    email,
                    password: "TestPassword123456"
                }
            });

            assert.equal(
                loginResponse.statusCode,
                200
            );
            const loginBody = loginResponse.json();
            assert.equal(
                typeof loginBody.accessToken,
                "string"
            );
            const profileResponse = await app.inject({
                method: "GET",
                url: "/api/v1/auth/me",

                headers: {
                    authorization:
                        `Bearer ${loginBody.accessToken}`
                }
            });
            assert.equal(
                profileResponse.statusCode,
                200
            );
            assert.equal(
                profileResponse.json().email,
                email
            );
        }
    );
    await t.test(
        "rejects duplicated emails",
        async () => {
            const email =
                `duplicate-${randomUUID()}@example.com`;
            const firstResponse =
                await registerUser(email);
            assert.equal(
                firstResponse.statusCode,
                201
            );
            const secondResponse =
                await registerUser(email);
            assert.equal(
                secondResponse.statusCode,
                409
            );
        }
    );
    await t.test(
        "rejects incorrect passwords",
        async () => {
            const email =
                `password-${randomUUID()}@example.com`;
            const registerResponse =
                await registerUser(email);
            assert.equal(
                registerResponse.statusCode,
                201
            );
            const loginResponse = await app.inject({
                method: "POST",
                url: "/api/v1/auth/login",
                payload: {
                    email,
                    password: "WrongPassword123456"
                }
            });
            assert.equal(
                loginResponse.statusCode,
                401
            );
        }
    );
    await t.test(
        "rejects missing tokens",
        async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/auth/me"
            });
            assert.equal(
                response.statusCode,
                401
            );
        }
    );
    await t.test(
        "rejects invalid tokens",
        async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/auth/me",
                headers: {
                    authorization:
                        "Bearer invalid-token"
                }
            });
            assert.equal(
                response.statusCode,
                401
            );
        }
    );
    await t.test(
        "rejects expired tokens",
        async () => {
            const token = app.jwt.sign(
                {
                    sub: randomUUID(),
                    role: "user"
                },
                {
                    expiresIn: "1s"
                }
            );
            await sleep(2100);
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/auth/me",
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            assert.equal(
                response.statusCode,
                401
            );
        }
    );
});