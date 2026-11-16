import { assessmentsParamsSchema, averageResponseSchema, createAssessmentSchema, errorAverageSchema,assessmentGradeItemSchema, assessmentResponseSchema,errorAssessmentSchema} from "./assessments.schema.js";
import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { assessmentsService } from "./assessments.service.js";
import { assessmentsRepository } from "./assessments.repository.js";
import type { gradeInput } from "./grades.service.js";
import { calculateGradeAverage } from "./grades.service.js";

export function assessmentsRoutes(pool:Pool){
    return async function(app:FastifyInstance){
        const routes = app.withTypeProvider<ZodTypeProvider>();
        const repository = new assessmentsRepository(pool);
        const service = new assessmentsService(repository);

        routes.get("/subjects/:id/average",{
            onRequest:[requireAuth],
            schema:{
                params:assessmentsParamsSchema,
                response:{
                    200:averageResponseSchema,
                    404:errorAverageSchema,
                }
            }
            }, async(request,reply)=>{
                const {subjectId} = request.params;
                const result = await service.getSubjectAverageById(subjectId,request.user.sub);
                if (!result) {
                    return reply.status(404).send();
                        }
                const {grade,weight} = assessmentGradeItemSchema.parse(result);
                const resultValues:gradeInput[] = [{grade,weight}];  
                const average = calculateGradeAverage(resultValues); 
                return reply.code(200).send(average);         
        });
        routes.get("/assessments", {
            onRequest:[requireAuth],
            schema:{
                response:{
                    200:assessmentResponseSchema,
                    404:errorAssessmentSchema
                }
            }
            } , async(request)=>{
                return service.getAssessments(subjectId,request.user.sub);
            }
        )   
    };
};