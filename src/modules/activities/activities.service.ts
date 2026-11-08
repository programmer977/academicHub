import { activitiesRepository } from "./activities.repository.js";


export class activitiesService{
    constructor(private readonly repository:activitiesRepository){};

    async listActivities(subjectId:string){
        return this.repository.findAllActivitiesByUser(subjectId);
    }
}