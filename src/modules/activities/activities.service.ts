import { ActivitiesRepository } from "./activities.repository.js";
import { updateActivityInput } from "./activities.schema.js";


export class ActivitiesService{
    constructor(private readonly repository:ActivitiesRepository){};

    async listActivities(userId:string){
        return this.repository.findAllActivitiesByUser(userId);
    }
    async insertActivitie(userId:string,subjectId:string,name:string,description:string|null,status:string,dueAt:Date){
        return this.repository.createActivity(userId,subjectId,name,description,status,dueAt);
    }
    async getActivityById(activityId:string,userId:string){
        return this.repository.findActivityById(activityId,userId);
    }
    async updateActivity(activitieId:string,userId:string,data:updateActivityInput){
        return this.repository.patchActivity(activitieId,userId,data);;
    }
}