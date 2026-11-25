export type Assessment = {
    id: string;
    subjectId: string;
    title: string;
    grade: number | null;
    weight: number;
    dueAt: string;
};
export type CreateAssessmentInput = {
    subjectId: string;
    title: string;
    grade?: number | null;
    weight: number;
    dueAt: string;
};
export type UpdateAssessmentInput =Partial<CreateAssessmentInput>;