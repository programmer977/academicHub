export type DeadlineType =
    | "activity"
    | "assessment";

export type Deadline = {
    title: string;
    type: DeadlineType;
    dueAt: string;
};