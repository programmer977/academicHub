import {Pool} from "pg";

export type activitie = {
    id:string,
    name:string,
    description:string|null,
    status:"pending" | "in_progress" | "completed",
    dueAt:Date,
};

export class activitiesRepository{
    constructor(private readonly pool:Pool){};

    async findAllActivitiesByUser(userId:string):Promise<activitie[]>{
        const result = await this.pool.query(`SELECT a.id, a.subject_id AS "subjectId",s.name AS "subjectName", a.title AS name, a.description, a.status, a.due_at AS "dueAt" FROM activities AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.user_id = $1 ORDER BY a.due_at ASC;`,[userId]);
        return result.rows;
    }
    async createActivitie(userId:string,subjectId:string,name:string,description:string|null,status:string,dueAt:Date):Promise<activitie | null>{
        const result = await this.pool.query<activitie>(`INSERT INTO activities (subject_id,title,description,status,due_at) SELECT s.id,$3,$4,$5,$6 FROM subjects AS s WHERE s.id = $1 AND s.user_id = $2 RETURNING id,subject_id,title AS name,description,status,due_at AS "dueAt";`,[subjectId,userId,name,description,status,dueAt]);
        return result.rows[0]??null;
    }
    async findActivitiesById(subjectId:string,userId:string):Promise<activitie|null>{
        const result = await this.pool.query<activitie>(`SELECT a.id, a.title AS name, a.description, a.status, a.due_at AS "dueAt" FROM activities AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE a.id = $1 AND s.user_id = $2;,`,[subjectId,userId]);
        return result.rows[0]??null;
    }
    async patchActivitie(subjectId:string,userId:string){
        const result = await this.pool.query<activitie>(`SELECT 1`);
        return result.rows[0]??null;
    }
}