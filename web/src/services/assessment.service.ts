import { apiFetch } from "../core/api.ts";
import type {Assessment,CreateAssessmentInput,UpdateAssessmentInput} from "../types/assessment.ts";

export function listAssessments(): Promise<Assessment[]> {
    return apiFetch<Assessment[]>("/assessments");
}
export function getAssessment(id: string): Promise<Assessment> {
    return apiFetch<Assessment>(`/assessments/${id}`);
}
export function createAssessment(data: CreateAssessmentInput): Promise<Assessment> {
    return apiFetch<Assessment>("/assessments", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
export function updateAssessment(
    id: string,
    data: UpdateAssessmentInput
): Promise<Assessment> {
    return apiFetch<Assessment>(
        `/assessments/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(data)
        }
    );
}
export function deleteAssessment(
    id: string
): Promise<void> {
    return apiFetch<void>(
        `/assessments/${id}`,
        {
            method: "DELETE"
        }
    );
}