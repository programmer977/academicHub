import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { createActivitieSchema,activitieResponseSchema,errorActivitiesResponseSchema } from "./activities.schema.js";

export function activitiesRoutes(pool:Pool){
    return async function (app:FastifyInstance){
        const routes = app.withTypeProvider<ZodTypeProvider>();

        routes.get("/activities",{
            onRequest:requireAuth,
            schema:{
                response:{
                    200:activitieResponseSchema.array(),
                    404:errorActivitiesResponseSchema,
                }
            }
        })
    }
}