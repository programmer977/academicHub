import { assessmentsRepository } from "./assessments.repository.js";

export class assessmentsService{
    constructor(private readonly repository:assessmentsRepository){}
    
    async getSubjectAverageById(subjectId:string,userId:string){
        return this.repository.findAverageOfSubject(subjectId,userId);
    }
    async getAllAssessments(userId:string){
        return this.repository.getAllAssessments(userId);
    }
    async postAssessmente(userId:string,subjectId:string,title:string,grade:number,weight:number,dueAt:string){
        return this.repository.createAssessment(userId,subjectId,title,grade,weight,dueAt);
    }
} 