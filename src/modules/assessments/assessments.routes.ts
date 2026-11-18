import { assessmentsParamsSchema, averageResponseSchema, createAssessmentSchema, errorAverageSchema,assessmentGradeItemSchema, assessmentResponseSchema,errorAssessmentSchema} from "./assessments.schema.js";
import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { assessmentsService } from "./assessments.service.js";
import { assessmentsRepository } from "./assessments.repository.js";
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
                const {id} = request.params;
                const result = await service.getSubjectAverageById(id,request.user.sub);
                if (result === null) {return reply.code(404).send({message:"average not found"});}
                const assesments = assessmentGradeItemSchema.array().parse(result);
                const average = calculateGradeAverage(assesments);
                return reply.code(200).send(average);         
        });
        routes.get("/assessments", {
            onRequest:[requireAuth],
            schema:{
                response:{
                    200:assessmentResponseSchema.array(),
                    404:errorAssessmentSchema
                }
            }
            } , async(request,reply)=>{
                const assesments = await service.getAllAssessments(request.user.sub);
                if(!assesments){
                    return reply.code(404).send({message:"assessments not found"});
                } return reply.code(200).send(assesments);
            }); 
            routes.post("/assessments",{
                onRequest:[requireAuth],
                schema:{
                    body:createAssessmentSchema,
                    response:{
                        201:assessmentResponseSchema,
                        404:errorAssessmentSchema
                    }
                }
            }, async (request,reply)=>{
                const {subjectId,title,grade,weight,dueAt} = request.body;
                const assessment = await service.postAssessment(request.user.sub,subjectId,title,grade??null,weight,dueAt);
                if (!assessment) {
                    return reply.code(404).send({message: "Subject not found"});
                        }
                return reply.code(201).send(assessment);
            }
        );
        routes.get("/assessments/:id",{
            onRequest:[requireAuth],
            schema:{
                params:assessmentsParamsSchema,
                response:{
                    200:assessmentResponseSchema,
                    400:errorAssessmentSchema
                    }
                }
            } , async (request,reply)=>{
                const {id} = request.params;
                const result = await service.getAssessmentbyId;
                if(!result){return reply.code(400).send({message:"assessment not found"})};
                return reply.code(200).send(result);
            }
        )
    };
};