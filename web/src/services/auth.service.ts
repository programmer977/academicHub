import { apiFetch } from "../core/api.ts";

import type {RegisterInput,LoginInput,LoginResponse,User} from "../types/auth.ts";

export function register(data: RegisterInput): Promise<User> {
    return apiFetch<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
export function login(data: LoginInput): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
export function getProfile(): Promise<User> {
    return apiFetch<User>("/auth/me");
}