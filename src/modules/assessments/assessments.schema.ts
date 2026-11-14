import {z} from "zod/v4";

const gradeSchema = z.number().min(0).max(10).refine(
    (value)=>Math.abs(value*100-Math.round(value*100))<1e-8,{
        message:"Grade must have at most two decimal places"
    });

export const createAssessmentSchema = z.object({
    subjectId:z.uuid(),
    title:z.string().min(1).max(150),
    grade:gradeSchema.nullable().optional(),
    weight:z.number().int().min(1).max(10),
    dueAt:z.iso.datetime({offset:true}),
})