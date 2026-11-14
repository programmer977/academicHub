import {Pool} from "pg";

export class assessmentsRepository{
    constructor(private readonly pool:Pool){}

    async findAverageOfSubject(userId:string,subjectId:string){
        const result = await this.pool.query(`SELECT a.grade, a.weight FROM assessments AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.id = $1 AND s.user_id = $2;`,[userId,subjectId]);
        if(!result){return null};
        return result.rows[0];
    }
}