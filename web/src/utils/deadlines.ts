export type DeadlineStatus =| "overdue" | "urgent"| "upcoming"| "future";

export function getDeadlineStatus(dueAt: string,now: number = Date.now()): DeadlineStatus {
    const difference =new Date(dueAt).getTime() - now;
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;
    if (difference < 0) {
        return "overdue";
    }
    if (difference <= day) {
        return "urgent";
    }
    if (difference <= 7 * day) {
        return "upcoming";
    }
    return "future";
}