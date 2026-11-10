import { activitiesRepository } from "./activities.repository.js";
import { UpdateActivityInput } from "./activities.schema.js";


export class activitiesService{
    constructor(private readonly repository:activitiesRepository){};

    async listActivities(userId:string){
        return this.repository.findAllActivitiesByUser(userId);
    }
    async insertActivitie(userId:string,subjectId:string,name:string,description:string|null,status:string,dueAt:Date){
        return this.repository.createActivitie(userId,subjectId,name,description,status,dueAt);
    }
    async getActivitiesById(activityId:string,userId:string){
        return this.repository.findActivitiesById(activityId,userId);
    }
    async updateActivitie(activitieId:string,userId:string,data:UpdateActivityInput){
        return this.repository.patchActivitie(activitieId,userId,data);;
    }
}