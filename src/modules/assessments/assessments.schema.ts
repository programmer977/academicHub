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
    dueAt:z.iso.datetime({offset:true}),
});
export const createAssessmentSchema = z.object({
    subjectId:z.uuid(),
    title:z.string().min(1).max(150),
    grade:gradeSchema.nullable().optional(),
    weight:z.number().int().min(1).max(10),
    dueAt:z.iso.datetime({ offset: true }),
})
export const assessmentVoidResponseSchema = z.void();
export const assessmentsParamsSchema = z.object({id:z.uuid()});
export const averageResponseSchema = z.number().nullable();
export const errorAverageSchema = z.object({message:z.string()});
export const errorAssessmentSchema = z.object({message:z.string()});
export const assessmentGradeItemSchema = z.object({
    grade: gradeSchema.nullable(),
    weight: z.number().int().min(1).max(10),
});
export const updateAssessmentSchema = createAssessmentSchema.partial().refine(
        (data) => Object.keys(data).length > 0,{message: "Provide at least one field"}
    );
export type updateAssessmentType = z.infer<typeof updateAssessmentSchema>;