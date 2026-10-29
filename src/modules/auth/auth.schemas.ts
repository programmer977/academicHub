import {z} from "zod";

export const registerSchema = z.object({
    name:z.string().min(2).max(100),
    email:z.string().trim().toLowerCase().email().max(254),
    password:z.string().min(12).max(128)
});
export const loginSchema = z.object({
    email:z.string().trim().toLowerCase().email(),
    password:z.string().min(1)
})