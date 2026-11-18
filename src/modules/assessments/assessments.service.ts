import { assessmentsRepository } from "./assessments.repository.js";
import { updateAssessmentType } from "./assessments.schema.js";

export class assessmentsService{
    constructor(private readonly repository:assessmentsRepository){}
    
    async getSubjectAverageById(subjectId:string,userId:string){
        return this.repository.findAverageOfSubject(subjectId,userId);
    }
    async getAllAssessments(userId:string){
        return this.repository.getAllAssessments(userId);
    }
    async postAssessment(userId:string,subjectId:string,title:string,grade:number|null,weight:number,dueAt:string){
        return this.repository.createAssessment(userId,subjectId,title,grade,weight,dueAt);
    }
    async getAssessmentbyId(userId:string,assessmentId:string){
        return this.repository.findAssessmentById(userId,assessmentId);
    }
    async updateAssessment(userId:string,assessmentId:string,data:updateAssessmentType){
        return this.repository.patchAssessment(userId,assessmentId,data);
    }
    async deleteAssessment(userId:string,assesmentId:string){
        return this.repository.deleteAssessment(userId,assesmentId);
    }
} 