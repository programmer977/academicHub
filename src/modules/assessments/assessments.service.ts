import { assessmentsRepository } from "./assessments.repository.js";

export class assessmentsService{
    constructor(private readonly repository:assessmentsRepository){}
    
    async getSubjectAverageById(userId:string,subjectId:string){
        return this.repository.findAverageOfSubject(userId,subjectId);
    }
} 