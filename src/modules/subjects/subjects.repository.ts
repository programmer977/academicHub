import {Pool} from "pg";

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
};