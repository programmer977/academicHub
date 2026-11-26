import {getAccessToken,clearSession} from "./session.ts";

export class ApiError extends Error {
    readonly status: number;
    constructor(status: number, message: string) {super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export async function apiFetch<T>(path: string,options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");}
    const token = getAccessToken();
    if (token !== null) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(`/api/v1${path}`, {...options,headers});
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (response.status === 401 && token !== null) {
            clearSession();
            window.dispatchEvent(new Event("session-expired"));
        }
        throw new ApiError(response.status,body?.message ?? "Falha na requisição");
    }
    if (response.status === 204) {
        return undefined as T;
    }
    if (
    response.status === 401 &&
    token !== null &&
    token === getAccessToken()
) {
    clearSession();
    window.dispatchEvent(
        new Event("session-expired")
    );
}
    return await response.json() as T;

}