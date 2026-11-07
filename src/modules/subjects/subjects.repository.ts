import {Pool} from "pg";
import { id } from "zod/locales";

export type subject = {
    id:string,
    name:string,
    description:string|null,
}

export class subjectRepository{
    constructor(private readonly pool : Pool){};

    async findAllByUser(userId:string):Promise<subject[]>{
    const result = await this.pool.query(`SELECT id,name,description FROM subjects WHERE user_id=$1 ORDER BY name ASC`,[userId]);
    return result.rows;
}
    async create(userId:string,name:string,description:string|null):Promise<subject>{
    const result = await this.pool.query(`INSERT INTO subjects(user_id,name,description) VALUES ($1,$2,$3) RETURNING id,name,description`,[userId,name,description]);
    const subject = result.rows[0];
    if(!subject){
        throw new Error("subject creation failed");
    } return subject;
}
    async update(userId:string,subjectId:string,data:{name?:string | null | undefined,description?:string | null | undefined}):Promise<subject|null>{
        const result = await this.pool.query(`UPDATE subjects SET name = CASE WHEN $1::boolean THEN $2 ELSE name END, description = CASE WHEN $3::boolean THEN $4 ELSE description END WHERE id = $5 AND user_id = $6 RETURNING id, name, description`,[data.name !== undefined,data.name,data.description !== undefined,data.description,subjectId,userId]);
        const subject = result.rows[0];
        if(!subject){
            return null;
        } return subject;
    }
    async delete(userId:string,subjectId:string):Promise<boolean>{
        const result = await this.pool.query(`DELETE FROM subjects WHERE id = $1 AND user_id = $2 RETURNING id`,[subjectId,userId]);
        return result.rows.length>0;
    }
};