import { assessmentsParamsSchema, averageResponseSchema, createAssessmentSchema, errorAverageSchema } from "./assessments.schema.js";
import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { assessmentsService } from "./assessments.service.js";
import { assessmentsRepository } from "./assessments.repository.js";

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
            }, async(request)=>{
                const {subjectId} = request.params;
                return service.getSubjectAverageById(request.user.sub,subjectId);
        });
    };
};