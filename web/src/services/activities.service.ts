import { apiFetch } from "../core/api.ts";
import type {Activity,CreateActivityInput,UpdateActivityInput} from "../types/activity.ts";
export function listActivities(): Promise<Activity[]> {
    return apiFetch<Activity[]>("/activities");
}
export function getActivity(id: string): Promise<Activity> {
    return apiFetch<Activity>(`/activities/${id}`);
}
export function createActivity(data: CreateActivityInput): Promise<Activity> {
    return apiFetch<Activity>("/activities", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
export function updateActivity(id: string,data: UpdateActivityInput): Promise<Activity> {
    return apiFetch<Activity>(`/activities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    });
}
export function deleteActivity(id: string): Promise<void> {
    return apiFetch<void>(`/activities/${id}`, {
        method: "DELETE"
    });
}