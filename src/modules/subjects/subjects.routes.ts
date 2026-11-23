import {z} from "zod/v4";
import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { createSubjectSchema,errorDeadlineSchema,deadlineResponseSchema,errorResponseSchema,subjectParamsSchema,subjectResponseSchema,updateSubjectSchema } from "./subjects.schemas.js";
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
            tags:["Subjects"],
            summary:"Get all subjects.",
            description:"Get all subjects for the authenticated user.",
            response:{
                200:subjectResponseSchema.array(),
                },
            security:[{bearerAuth:[]}],
            }
        } ,async (request)=>{
            return service.listSubjects(request.user.sub)
    });
    routes.get("/subjects/:id",{
        onRequest: [requireAuth],
        schema: {
            tags: ["Subjects"],
            summary: "Get subject by ID",
            description:"Returns a subject owned by the authenticated user.",
            security:[{bearerAuth:[]}],
            params: subjectParamsSchema,
            response: {
                200: subjectResponseSchema,
                404: errorResponseSchema
            }
        }
    },async (request, reply) => {
        const { id } = request.params;
        const subject = await service.getSubject(request.user.sub,id);
        if (!subject) {
            return reply.code(404).send({message: "Subject not found"});
        }return reply.code(200).send(subject);
    });
    routes.post("/subjects",{
        onRequest:[requireAuth],
        schema:{
            tags: ["Subjects"],
            summary: "Create a subject",
            description:"Creates a new academic subject for the authenticated user.",
            security:[{bearerAuth:[]}],
            body:createSubjectSchema,
            response:{
                201:subjectResponseSchema,
                400: errorResponseSchema,
                401: errorResponseSchema
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
                tags: ["Subjects"],
                summary: "Update a subject",
                description:"Update a new academic subject for the authenticated user.",
                security:[{bearerAuth:[]}],
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
            tags: ["Subjects"],
            summary: "Delete a subject",
            description:"Delete a new academic subject for the authenticated user.",
            security:[{bearerAuth:[]}],
            params:subjectParamsSchema,
            response: {
                204: z.undefined(),                                                                              
                404: errorResponseSchema
            }}
    },async(request,reply)=>{
        const {id} = request.params as {id:string};
        const deleted = await service.deleteSubject(request.user.sub,id);
        if(!deleted){
            return reply.code(404).send({message: "Subject not found"})
        }
        return reply.code(204).send();
            }
        );
        routes.get("/deadlines",{
            onRequest:[requireAuth],
            schema:{
                tags: ["Deadlines"],
                summary: "Get all deadlines",
                description:"Get all deadlines for the authenticated user.",
                security:[{bearerAuth:[]}],
                response:{
                    200:deadlineResponseSchema.array(),
                    404:errorDeadlineSchema
                    }
                }
            }, async(request,reply)=>{
                    const result = await service.listDeadlines(request.user.sub);
                    if(!result){return reply.code(404).send({message:"deadlines not found"})};
                    return reply.code(200).send(result);
                }
        );
    }
}