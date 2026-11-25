import { apiFetch } from "../core/api.ts";

import type {Subject,CreateSubjectInput,UpdateSubjectInput} from "../types/subject.ts";
export function listSubjects(): Promise<Subject[]> {
    return apiFetch<Subject[]>("/subjects");
}
export function getSubject(id: string): Promise<Subject> {
    return apiFetch<Subject>(`/subjects/${id}`);
}
export function createSubject(data: CreateSubjectInput): Promise<Subject> {
    return apiFetch<Subject>("/subjects", {method: "POST",body: JSON.stringify(data)
    });
}
export function updateSubject(id: string,data: UpdateSubjectInput): Promise<Subject> {
    return apiFetch<Subject>(`/subjects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    });
}
export function deleteSubject(id: string): Promise<void> {
    return apiFetch<void>(`/subjects/${id}`, {
        method: "DELETE"
    });
}
export function getSubjectAverage(id: string): Promise<number | null> {
    return apiFetch<number | null>(`/subjects/${id}/average`);
}