import {Pool} from "pg";

export type activitie = {
    id:string,
    name:string,
    description:string|null,
    status:string,
    dueAt:Date,
};

export class activitiesRepository{
    constructor(private readonly pool:Pool){};

    async findAllActivitiesByUser(userId:string):Promise<activitie[]>{
        const result = await this.pool.query(`SELECT a.id, a.title AS name, a.description, a.status, a.due_at AS "dueAt", FROM activities AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.user_id = $1 ORDER BY a.due_at ASC;`,[userId]);
        return result.rows;
    }
    async createActivitie(userId:string,name:string,description:string|null,status:string,dueAt:Date):Promise<any>{
        const result = await this.pool.query(`SELECT 1`);
        return null;
    }
}