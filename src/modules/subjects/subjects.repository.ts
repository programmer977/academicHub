import {Pool} from "pg";

export type subject = {
    id:string,
    name:string,
    description:string|null,
}

export class subjectRepository{
    constructor(readonly pool : Pool){};
}

async findAllByUser(userId:string):Promise<subject[]>{
    
}