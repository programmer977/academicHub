import { subjectRepository } from "./subjects.repository.js";

export class subjectService{
    constructor(private readonly repository:subjectRepository){}

    async listSubjects(userId:string){
        return this.repository.findAllByUser(userId);
    };
    async createSubject(userId:string,name:string,description:string|null){
        return this.repository.create(userId,name,description);
    }
    async updateSubject(userId:string,subjectId:string,data:{name?:string | null | undefined,description?:string | null | undefined}){
        return this.repository.update(userId,subjectId,data);
    }
    async deleteSubject(userId:string,subjectId:string){
        return this.repository.delete(userId,subjectId);
    }
}