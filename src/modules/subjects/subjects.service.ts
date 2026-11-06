import { subjectRepository } from "./subjects.repository.js";

export class subjectService{
    constructor(private readonly repository:subjectRepository){}

    async listSubjects(userId:string){
        return this.repository.findAllByUser(userId);
    };
    async createSubject(userId:string,name:string,description:string|null){
        return this.repository.create(userId,name,description);
    }
}