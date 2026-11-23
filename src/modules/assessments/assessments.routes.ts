import {z} from "zod/v4";
import { assessmentsParamsSchema, averageResponseSchema, createAssessmentSchema, errorAverageSchema,assessmentGradeItemSchema, assessmentResponseSchema,errorAssessmentSchema, assessmentVoidResponseSchema, updateAssessmentSchema} from "./assessments.schema.js";
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
            schema: {
            tags: ["Assessments"],
            summary: "Calculate subject average",
            description:"Calculates the weighted average of graded assessments for a subject. Returns null when no graded assessments are available.",
            security: [{ bearerAuth: [] }],
            params: assessmentsParamsSchema,
            response: {
                200: averageResponseSchema,
                400: errorAverageSchema,
                401: errorAverageSchema,
                404: errorAverageSchema
            }}
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
                tags:["Assessments"],
                summary:"Get all assessments",
                description:"Get all assessments associated with a subject owned by the authenticated user.",
                security:[{bearerAuth:[]}],
                response:{
                    200:assessmentResponseSchema.array(),
                    204:z.undefined(),
                }
            }
            } , async(request,reply)=>{
                const assesments = await service.getAllAssessments(request.user.sub);
                if(!assesments){
                    return reply.code(204).send({message:"assessments not found"});
                } return reply.code(200).send(assesments);
            }); 
            routes.post("/assessments",{
                onRequest:[requireAuth],
                schema:{
                    tags:["Assessments"],
                    summary:"Create an assessment",
                    description:"Create an assessment associated with a subject owned by the authenticated user.",
                    security:[{bearerAuth:[]}],
                    body:createAssessmentSchema,
                    response:{
                        201:assessmentResponseSchema,
                        400:errorAssessmentSchema,
                        401:errorAssessmentSchema,
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
                tags:["Assessments"],
                summary:"Get an assessment by Id",
                description:"Get an assessment by Id associated with a subject owned by the authenticated user.",
                security:[{bearerAuth:[]}],
                params:assessmentsParamsSchema,
                response:{
                    200:assessmentResponseSchema,
                    404:errorAssessmentSchema
                    }
                }
            } , async (request,reply)=>{
                const {id} = request.params;
                const result = await service.getAssessmentbyId(request.user.sub,id);
                if(!result){return reply.code(404).send({message:"assessment not found"})};
                return reply.code(200).send(result);
            }
        );
        routes.patch("/assessments/:id",{
            onRequest:[requireAuth],
            schema:{
                tags:["Assessments"],
                summary:"Patch an assessment",
                description:"Patch an assessment associated with a subject owned by the authenticated user.",
                security:[{bearerAuth:[]}],
                params:assessmentsParamsSchema,
                body:updateAssessmentSchema,
                response:{
                    200:assessmentResponseSchema,
                    404:errorAssessmentSchema,
                }
            }
            }, async (request,reply)=>{
                const {id} = request.params;
                const updated = await service.updateAssessment(request.user.sub,id,request.body);
                if (!updated) {return reply.code(404).send({message: "Assessment not found or subject unavailable"});};
                return reply.code(200).send(updated);
            }
        );
        routes.delete("/assessments/:id",{
            onRequest:[requireAuth],
            schema:{
                tags:["Assessments"],
                summary:"Delete an assessment",
                description:"Delete an assessment associated with a subject owned by the authenticated user.",
                security:[{bearerAuth:[]}],
                params:assessmentsParamsSchema,
                response:{
                    204:assessmentVoidResponseSchema,
                    404:errorAssessmentSchema,
                    }
                }
            }, async (request,reply)=>{
                const {id} = request.params;
                const result = await service.deleteAssessment(request.user.sub,id);
                if(!result){return reply.code(404).send({message:"assessment not found"})};
                return reply.code(204).send();
            }
        )

    };
};