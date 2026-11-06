import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { createSubjectSchema,subjetResponseSchema,updateSubjectSchema } from "./subjects.schemas.js";
import { subjectRepository } from "./subjects.repository.js";
import { subjectService } from "./subjects.service.js";

export function subjectRoutes(pool:Pool){
    return async function(app:FastifyInstance){
    const routes = app.withTypeProvider<ZodTypeProvider>();
    const repository = new subjectRepository(pool);
    const service = new subjectService(repository);

    routes.get("/subjects",{
        onRequest:[requireAuth],
        schema:{
            response:{
                200:subjetResponseSchema.array(),
                }
            }
        } ,async (request)=>{
            return service.listSubjects(request.user.sub)
    })
    }
}