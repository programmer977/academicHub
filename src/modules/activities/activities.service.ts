import { activitiesRepository } from "./activities.repository.js";


export class activitiesService{
    constructor(private readonly repository:activitiesRepository){};

    async listActivities(userId:string){
        return this.repository.findAllActivitiesByUser(userId);
    }
    async insertActivitie(userId:string,subjectId:string,name:string,description:string|null,status:string,dueAt:Date){
        return this.repository.createActivitie(userId,subjectId,name,description,status,dueAt);
    }
    async getActivitiesById(subjectId:string,userId:string){
        return this.repository.findActivitiesById(subjectId,userId);
    }
    async updateActivitie(subjectId:string,userId:string){
        return this.repository.patchActivitie(subjectId,userId);
    }
}