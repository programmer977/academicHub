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

    async findAllActivitiesByUser(subjectId:string):Promise<activitie[]>{
        const result = await this.pool.query(`SELECT a.id, a.title, a.description, a.status, a.due_at, s.name AS subject_name FROM activities AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.user_id = $1 ORDER BY a.due_at ASC;`,[subjectId]);
        return result.rows;
    }
}