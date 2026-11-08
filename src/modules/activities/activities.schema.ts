import {z} from "zod/v4";

export const createActivitieSchema = z.object({
    subjectId: z.uuid(),
    name: z.string().min(1).max(150),
    description: z.string().max(2000).nullable().optional,
    status: z.enum(["pending","in_progress","completed"]).default("pending"),
    dueAt:z.iso.datetime({offset:true}),
})