import {z} from "zod";

export const registerSchema = z.object({
    name:z.string().min(2).max(100),
    email:z.string().trim().toLowerCase().email().max(254),
    password:z.string().min(12).max(128)
});
export const loginSchema = z.object({
    email:z.string().trim().toLowerCase().email(),
    password:z.string().min(1)
});
export const publicUserSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["user", "admin"])
});

export const loginResponseSchema = z.object({
    accessToken: z.string(),
    tokenType: z.literal("Bearer"),
    expiresIn: z.number().int().positive()
});

export const authErrorSchema = z.object({
    message: z.string()
});