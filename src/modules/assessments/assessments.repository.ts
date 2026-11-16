import { Interface } from "node:readline";
import {Pool} from "pg";

interface assesment {
    id:string,
    subjectId:string,
    title:string,
    grade:number,
    weight:number,
}

export class assessmentsRepository{
    constructor(private readonly pool:Pool){}

    async findAverageOfSubject(subjectId:string,userId:string):Promise<assesment[]|null>{
        const result = await this.pool.query(`SELECT a.grade, a.weight FROM assessments AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.id = $1 AND s.user_id = $2;`,[subjectId,userId]);
        if(!result){return null};
        return result.rows;
    }
}