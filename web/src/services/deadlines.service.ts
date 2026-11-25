import { apiFetch } from "../core/api.ts";
import type { Deadline } from "../types/deadline.ts";
export function listDeadlines(): Promise<Deadline[]> {
    return apiFetch<Deadline[]>("/deadlines");
}