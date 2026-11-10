import {Pool} from "pg";
import type { UpdateActivityInput } from "./activities.schema.js";

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
    async patchActivitie(activitieId:string,userId:string,data:UpdateActivityInput):Promise<activitie|null>{
        const {name,description,status,dueAt,subjectId}=data;
        const result = await this.pool.query<activitie>(`UPDATE activities AS a SET
    title = CASE
        WHEN $1::boolean THEN $2::text
        ELSE a.title
    END,
    description = CASE
        WHEN $3::boolean THEN $4::text
        ELSE a.description
    END,
    status = CASE
        WHEN $5::boolean THEN $6::text
        ELSE a.status
    END,
    due_at = CASE
        WHEN $7::boolean THEN $8::timestamptz
        ELSE a.due_at
    END,
    subject_id = CASE
        WHEN $9::boolean THEN $10::uuid
        ELSE a.subject_id END
FROM subjects AS s
WHERE a.id = $11 AND s.id = a.subject_id AND s.user_id = $12
AND (NOT $9::boolean OR EXISTS (SELECT 1 FROM subjects AS target WHERE target.id = $10::uuid AND target.user_id = $12))
RETURNINGa.id,a.title AS name,a.description,a.status,a.due_at AS "dueAt";`,[
            name !== undefined,name ?? null,
            description !== undefined,description ?? null,
            status !== undefined,status ?? null,
            dueAt !== undefined,dueAt ?? null,
            subjectId !== undefined,subjectId ?? null,
            activitieId,userId]);
        return result.rows[0]??null;
    }
}