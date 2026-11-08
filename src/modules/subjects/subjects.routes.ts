import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { createSubjectSchema,errorResponseSchema,subjectParamsSchema,subjectResponseSchema,updateSubjectSchema } from "./subjects.schemas.js";
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
            body:createSubjectSchema,
            response:{
                201:subjectResponseSchema
                }
        }
        },async (request,reply)=>{
            const{name,description}=request.body;
            const subject = await service.createSubject(request.user.sub,name,description??null);
            return reply.code(201).send(subject);
        }
    ); 
        routes.patch("/subjects/:id",{
            onRequest:[requireAuth],
            schema:{
                body:updateSubjectSchema,
                params:subjectParamsSchema,
                response:{
                    200:subjectResponseSchema,
                    404:errorResponseSchema,
                }
            }
        },async (request,reply)=>{
            const {id} = request.params as {id:string};
            const {name,description}=request.body as {name?:string,description?:string};
            const updated = await service.updateSubject(request.user.sub,id,{name,description});
            if(!updated){
                return reply.code(404).send({message:"subject not found"});
            }
            return reply.code(200).send(updated);
        }
    );
    routes.delete("/subjects/:id",{
        onRequest:[requireAuth],
        schema:{
            params:subjectParamsSchema,
        }
    },async(request,reply)=>{
        const {id} = request.params as {id:string};
        const deleted = await service.deleteSubject(request.user.sub,id);
        if(!deleted){
            return reply.code(404).send({message: "Subject not found"})
        }
        return reply.code(204).send();
    }
)
    }
}