import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { createActivitieSchema,activitieResponseSchema,errorActivitiesResponseSchema,activitiesParamsSchema, updateActivitieSchema } from "./activities.schema.js";
import { activitiesService } from "./activities.service.js";
import { activitiesRepository } from "./activities.repository.js";
import { subject } from "../subjects/subjects.repository.js";
import { userInfo } from "node:os";

export function activitiesRoutes(pool:Pool){
    return async function (app:FastifyInstance){
        const routes = app.withTypeProvider<ZodTypeProvider>();
        const repository = new activitiesRepository(pool);
        const service = new activitiesService(repository);


        routes.get("/activities",{
            onRequest:requireAuth,
            schema:{
                response:{
                    200:activitieResponseSchema.array(),
                    404:errorActivitiesResponseSchema,
                    } 
                }
            },async (request)=>{
                    return service.listActivities(request.user.sub);
            }
        );
        routes.post("/activities",{
            onRequest:[requireAuth],
            schema:{
                body:createActivitieSchema,
                response:{
                    201:activitieResponseSchema,
                    404:errorActivitiesResponseSchema,
                }
            }
            }   ,async (request,reply)=>{
                const{subjectId,name,description,status,dueAt}=request.body ;
                const activitie = await service.insertActivitie(request.user.sub,subjectId,name,description??null,status,new Date(dueAt));
                if (!activitie) {
                    return reply.code(404).send({message: "Subject not found"});
                    };
                return reply.code(201).send(activitie);
            }
        );
        routes.get("/activities/:id",{
            onRequest:[requireAuth],
            schema:{
                params:activitiesParamsSchema,
                response:{
                    200:activitieResponseSchema,
                    404:errorActivitiesResponseSchema,
                    }
                }
            } , async (request,reply)=>{
                const {id}= request.params as {id:string};
                const activity = await service.getActivitiesById(id,request.user.sub);
                if(!activity){
                    return reply.code(404).send({message: "Activity not found"});
                } return reply.code(200).send(activity);
            }
        );
        routes.patch("/activities/:id",{
            onRequest:[requireAuth],
            schema:{
                params:activitiesParamsSchema,
                body:updateActivitieSchema,
                response:{
                    200:activitieResponseSchema,
                    400:errorActivitiesResponseSchema,
                }
            }
        }, async (request,reply)=> {
            const {id} = request.params;
            const updated = await service.updateActivitie(id,request.user.sub,request.body);
            if(!updated){
                reply.code(400).send({message: "Activity not found or subject unavailable"})
            } return reply.code(200).send(updated);
        }
    )
    }
}