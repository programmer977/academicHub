import {Pool} from "pg";

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
        const result = await this.pool.query<AssessmentGradeRow>(`SELECT a.grade:: double , a.weight FROM subjects AS s LEFT JOIN assessments AS a ON a.subject_id = s.id WHERE s.id = $1 AND s.user_id = $2;`,[subjectId,userId]);
        if (result.rows.length === 0) {return null;};
        const assessments: AssessmentGrade[] = [];
        for (const row of result.rows) {
            if (row.weight === null) {continue;};
            assessments.push({grade: row.grade,weight: row.weight});
        } return assessments;
    };
    async getAllAssessments(userId:string):Promise<AssessmentGrade[]|null>{
        const result = await this.pool.query<AssessmentGradeRow>(`SELECT a.id, a.subject_id as "subjectId" , a.title, a.grade, a.weight, a.due_at as "dueAt" FROM assessments AS a INNER JOIN subjects AS s ON s.id = a.subject_id WHERE s.user_id = $1 ORDER BY a.due_at ASC;;`,[userId]);
        if (result.rows.length === 0) {return null;};
        const assessments: AssessmentGrade[] = [];
        for (const row of result.rows) {
            if (row.weight === null) {continue;};
            assessments.push({
                grade: row.grade,
                weight: row.weight
            });
        }
        return assessments;
        }
        async createAssessment(userId:string,subjectId:string,title:string,grade:number,weight:number,dueAt:string):Promise<AssessmentResponse|null>{
            const result = await this.pool.query(`INSERT INTO assessments (subject_id,title,grade,weight,due_at) SELECT s.id,$3,$4,$5,$6 FROM subjects AS s WHERE s.id = $2 AND s.user_id = $1 RETURNING id,subject_id AS subjectId,title,grade,weight,due_at AS "dueAT"`,[userId,subjectId,title,grade,weight,dueAt]);
            const assessment:AssessmentResponse=result.rows[0];
            if(!assessment){return null};
            return assessment;
        }
    }
