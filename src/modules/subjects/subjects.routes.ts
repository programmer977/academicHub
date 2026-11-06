import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { createSubjectSchema,subjectResponseSchema,updateSubjectSchema } from "./subjects.schemas.js";
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
                200:subjectResponseSchema.array(),
                }
            }
        } ,async (request)=>{
            return service.listSubjects(request.user.sub)
    })
    routes.post("/subjects",{
        onRequest:[requireAuth],
        schema:{
            body:createSubjectSchema
        },response:{
            201:subjectResponseSchema
            }
        },async (request,reply)=>{
            const{name,description}=request.body;
        }const subject = service.createSubject(request.user.sub,name,description??null);
        return reply.code(201).send(subject);
    ); 
    }
}