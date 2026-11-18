import {Pool} from "pg";
import type {updateAssessmentType } from "./assessments.schema.js";

type AssessmentGrade = {
    grade: number | null;
    weight: number;
};

type AssessmentGradeRow = {
    grade: number | null;
    weight: number | null;
};

type AssessmentRow = {
    id: string;
    subjectId: string;
    title: string;
    grade: number | null;
    weight: number;
    dueAt: Date;
};

export type AssessmentResponse = {
    id: string;
    subjectId: string;
    title: string;
    grade: number | null;
    weight: number;
    dueAt: string;
};

export class assessmentsRepository{
    constructor(private readonly pool:Pool){}

    async findAverageOfSubject(subjectId:string,userId:string):Promise<AssessmentGrade[]|null>{
        const result = await this.pool.query<AssessmentGradeRow>(`SELECT a.grade::float8 AS grade , a.weight FROM subjects AS s LEFT JOIN assessments AS a ON a.subject_id = s.id WHERE s.id = $1 AND s.user_id = $2;`,[subjectId,userId]);
        if (result.rows.length === 0) {return null;};
        const assessments: AssessmentGrade[] = [];
        for (const row of result.rows) {
            if (row.weight === null) {continue;};
            assessments.push({grade: row.grade,weight: row.weight});
        } return assessments;
    };
    async getAllAssessments(userId:string):Promise<AssessmentResponse[]|null>{
        const result = await this.pool.query<AssessmentResponse>(`SELECT a.id, a.subject_id as "subjectId" , a.title, a.grade, a.weight, a.due_at as "dueAt" FROM assessments AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.user_id = $1 ORDER BY a.due_at ASC;;`,[userId]);
        return result.rows;
        }
    async createAssessment(userId:string,subjectId:string,title:string,grade:number|null,weight:number,dueAt:string):Promise<AssessmentResponse|null>{
        const result = await this.pool.query<AssessmentResponse>(`INSERT INTO assessments (subject_id,title,grade,weight,due_at) SELECT s.id,$3,$4,$5,$6 FROM subjects AS s WHERE s.id = $2 AND s.user_id = $1 RETURNING id,subject_id AS "subjectId",title,grade::float8 AS grade,weight,due_at AS "dueAt";`,[userId,subjectId,title,grade,weight,dueAt]);
        return result.rows[0]??null;
    }
    async findAssessmentById(userId:string,assesmentId:string):Promise<AssessmentResponse|null>{
        const result = await this.pool.query<AssessmentResponse>(`SELECT a.id, a.subject_id AS "subjectId", a.title, a.grade::float8 AS grade, a.weight, a.due_at AS "dueAt" FROM assessments AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE a.id = $1 AND s.user_id = $2;`,[assesmentId,userId]);
        return result.rows[0]??null;
    }
    async patchAssessment(userId:string,assessmentId:string,data:updateAssessmentType):Promise<AssessmentResponse|null>{
         const {subjectId,title,grade,weight,dueAt} = data;
        const result = await this.pool.query<AssessmentResponse>(`UPDATE assessments AS a SET title = CASE WHEN $1::boolean THEN $2::text ELSE a.title END,
            grade = CASE WHEN $3::boolean THEN $4::numeric(4,2) ELSE a.grade END,
            weight = CASE WHEN $5::boolean THEN $6::integer ELSE a.weight END,
            due_at = CASE WHEN $7::boolean THEN $8::timestamptz ELSE a.due_at END,
            subject_id = CASE WHEN $9::boolean THEN $10::uuid ELSE a.subject_id END 
            FROM subjects AS s WHERE a.id = $11 AND s.id = a.subject_id AND s.user_id = $12
            AND (NOT $9::boolean OR EXISTS ( SELECT 1 FROM subjects AS target WHERE target.id = $10::uuid AND target.user_id = $12))
            RETURNING a.id,a.subject_id AS "subjectId",a.title,a.grade::float8 AS grade,a.weight,a.due_at AS "dueAt";`,
            [title !== undefined,title ?? null,grade !== undefined,grade ?? null,
            weight !== undefined,weight ?? null,dueAt !== undefined,dueAt ?? null,
            subjectId !== undefined,subjectId ?? null,assessmentId,userId]);
        return result.rows[0]??null;
    }
    async deleteAssessment(userId:string,assesmentId:string){
        const result = await this.pool.query(`DELETE FROM assessments AS a USING subjects AS s WHERE a.id = $1 AND a.subject_id = s.id AND s.user_id = $2 RETURNING a.id;`,[assesmentId,userId]);
        return result.rows[0]>0;
    }
}
