import { assessmentsRepository } from "./assessments.repository.js";

export class assessmentsService{
    constructor(private readonly repository:assessmentsRepository){}
    
    async getSubjectAverageById(subjectId:string,userId:string){
        return this.repository.findAverageOfSubject(subjectId,userId);
    }
    async getAssessments(subjectId:string,userId:string){
        return this.repository
    }
} 