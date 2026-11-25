export type Subject = {
    id: string;
    name: string;
    description: string | null;
};
export type CreateSubjectInput = {
    name: string;
    description?: string | null;
};
export type UpdateSubjectInput =
    Partial<CreateSubjectInput>;