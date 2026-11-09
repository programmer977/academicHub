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
        const result = await this.pool.query(`SELECT a.id, a.title AS name, a.description, a.status, a.due_at AS "dueAt" FROM activities AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.user_id = $1 ORDER BY a.due_at ASC;`,[userId]);
        return result.rows;
    }
    async createActivitie(userId:string,subjectId:string,name:string,description:string|null,status:string,dueAt:Date):Promise<activitie>{
        const result = await this.pool.query(`INSERT INTO activities (subject_id,title,description,status,due_at) SELECT s.id,$3,$4,$5,$6 FROM subjects AS s HERE s.id = $1 AND s.user_id = $2 RETURNING id,subject_id,title,description,status,due_at;`[subjectId,userId,name,description,status,dueAt]);
        const activitie = result.rows[0];
    if(!activitie){
        throw new Error("activitie creation failed");
    } return activitie;
    }
}