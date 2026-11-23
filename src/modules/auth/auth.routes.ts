import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { hashPassword, verifyPassword } from "./password.js";
import { requireAuth } from "./auth.guard.js";
import { loginSchema, registerSchema ,loginResponseSchema , publicUserSchema,authErrorSchema } from "./auth.schemas.js";

type databaseUser = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    password_hash: string;
};

export function authRoutes(pool: Pool) {
    return async function (app: FastifyInstance) {
        const routes = app.withTypeProvider<ZodTypeProvider>();
        routes.post("/register", {schema:{
            tags:["Authentication"],
            summary: "Register a new user",
            description:"Creates a new account and returns the public user information.",
            body: registerSchema,
            response:{
            201: publicUserSchema,
            400: authErrorSchema,
            409: authErrorSchema
        }} }, 
        async (request, reply) => {const { name, email, password } = request.body;
            const passwordHash = await hashPassword(password);
            const result = await pool.query<databaseUser>(
                `INSERT INTO users (name, email, password_hash) 
                 VALUES ($1, $2, $3) 
                 RETURNING id, name, email, role`,
                [name, email, passwordHash]
            );
            const user = result.rows[0];
            if (!user) {
                return reply.code(409).send({ message: "User not registered" });
                }
            return reply.code(201).send(user);
        });
        routes.post("/login", { schema: { 
            tags: ["Authentication"],
            summary: "Authenticate user",
            description:"Validates user credentials and returns a JWT access token.",
            body: loginSchema ,
            response:{
                200: loginResponseSchema,
                400: authErrorSchema,
                401: authErrorSchema
            }} }, 
        async (request, reply) => {const { email, password } = request.body;
            const result = await pool.query<databaseUser>(
                `SELECT id, name, email, role, password_hash FROM users WHERE LOWER(email) = $1`,
                [email]
            );
            const user = result.rows[0];
            if (!user) {return reply.code(401).send({ message: "Invalid credentials" });}
            const passwordIsValid = await verifyPassword(user.password_hash, password);
            if (!passwordIsValid) {return reply.code(401).send({ message: "Invalid credentials" });}
            const token = await reply.jwtSign({ sub: user.id, role: user.role });  
            return reply.send({ accessToken: token, tokenType: "Bearer", expiresIn: 900 });
        });
        routes.get("/me", { 
            onRequest: [requireAuth],
            schema:{
                tags: ["Authentication"],
                summary: "Get authenticated user",
                description:"Returns the profile of the currently authenticated user.",
                security: [{ bearerAuth: [] }],
                response: {
                    200: publicUserSchema,
                    401: authErrorSchema
                        }
            }}, 
        async (request, reply) => {
            const result = await pool.query<databaseUser>(
                `SELECT id, name, email, role FROM users WHERE id = $1`,
                [request.user.sub]
            );
            const user = result.rows[0];
            if (!user) {return reply.code(401).send({ message: "Account no longer exists" });}
            return reply.send(user);
        });
    };
}