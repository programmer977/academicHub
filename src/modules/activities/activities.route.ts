import type { FastifyInstance } from "fastify";
import type {Pool} from "pg";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../auth/auth.guard.js";
import { createActivitieSchema,activitieResponseSchema,errorActivitiesResponseSchema,activitiesParamsSchema, updateActivitieSchema,responseWithNoContent } from "./activities.schema.js";
import { ActivitiesService } from "./activities.service.js";
import { ActivitiesRepository } from "./activities.repository.js";

export function activitiesRoutes(pool:Pool){
    return async function (app:FastifyInstance){
        const routes = app.withTypeProvider<ZodTypeProvider>();
        const repository = new ActivitiesRepository(pool);
        const service = new ActivitiesService(repository);


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
                const Activity = await service.insertActivitie(request.user.sub,subjectId,name,description??null,status,new Date(dueAt));
                if (!Activity) {
                    return reply.code(404).send({message: "Subject not found"});
                    };
                return reply.code(201).send(Activity);
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
                const activity = await service.getActivityById(id,request.user.sub);
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
                    404:errorActivitiesResponseSchema,
                }
            }
        }, async (request,reply)=> {
            const {id} = request.params;
            const updated = await service.updateActivity(id,request.user.sub,request.body);
            if(!updated){
                return reply.code(404).send({message: "Activity not found or subject unavailable"})
            }; 
            return reply.code(200).send(updated);
        }
    );
    routes.delete("/activities/:id",{
        onRequest:[requireAuth],
        schema:{
            params:activitiesParamsSchema,
            response:{
                404:errorActivitiesResponseSchema,
                204:responseWithNoContent,
                    }
                }
            },async(request,reply)=>{
                const {id} = request.params as {id:string};
                const deleted = await service.deleteActivityById(id,request.user.sub);
                if(!deleted){return reply.code(404).send({message: "Subject not found"});}
                return reply.code(204).send();
            }
        );
    }
}