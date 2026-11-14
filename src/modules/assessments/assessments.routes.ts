import { createAssessmentSchema } from "./assessments.schema.js";
import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";

export function assessmentsRoutes(pool:Pool){
    return async function(app:FastifyInstance){
        const routes = app.withTypeProvider<ZodTypeProvider>();
    }
}