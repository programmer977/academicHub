export type ActivityStatus = "pending"| "in_progress"| "completed";
export type Activity = {
    id: string;
    subjectId: string;
    name: string;
    description: string | null;
    status: ActivityStatus;
    dueAt: string;
};
export type CreateActivityInput = {
    subjectId: string;
    name: string;
    description?: string | null;
    status?: ActivityStatus;
    dueAt: string;
};
export type UpdateActivityInput =Partial<CreateActivityInput>;