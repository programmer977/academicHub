import {z} from "zod/v4";

const gradeSchema = z.number().min(0).max(10).refine(
    (value)=>Math.abs(value*100-Math.round(value*100))<1e-8,{
        message:"Grade must have at most two decimal places"
    });
export const assessmentResponseSchema = z.object({
    id:z.uuid(),
    subjectId:z.uuid(),
    title:z.string().min(1).max(150),
    grade:gradeSchema.nullable(),
    weight:z.number().int().min(1).max(10),
    dueAt:z.date,
});
export const createAssessmentSchema = z.object({
    subjectId:z.uuid(),
    title:z.string().min(1).max(150),
    grade:gradeSchema.nullable().optional(),
    weight:z.number().int().min(1).max(10),
    dueAt:z.date(),
})
export const assessmentsParamsSchema = z.object({id:z.uuid()});
export const averageResponseSchema = z.number().nullable();
export const errorAverageSchema = z.void();
export const errorAssessmentSchema = z.void();
export const assessmentGradeItemSchema = z.object({
    grade: gradeSchema,
    weight: z.number().int().min(1).max(10),
});