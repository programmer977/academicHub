import {uuid, z} from "zod/v4";

export const createSubjectSchema = z.object({
    name:z.string().trim().min(1).max(120),
    description:z.string().trim().max(1200).nullable().optional()
});
export const updateSubjectSchema = createSubjectSchema.partial().refine(
    (data)=>Object.keys(data).length>0,{message:"Provide at least one field"}
);
export const subjectParamsSchema = z.object({id:z.uuid()});
export const subjectResponseSchema = z.object({
    id:z.uuid(),
    name:z.string(),
    description:z.string().nullable(),
})
export const errorResponseSchema = z.object({message:z.string()})