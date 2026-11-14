export type gradeInput = {
    grade:number|null,
    weight:number,
};

export function calculateGradeAvarage(assessments:readonly gradeInput[]):number|null{
    let weightedTotal = 0; let totalWeight = 0;

    for(const assessment of assessments){
        if(assessment.grade === null){continue;};
    };
}