export type gradeInput = {
    grade:number|null,
    weight:number,
};

export function calculateGradeAverage(assessments:readonly gradeInput[]):number|null{
    let weightedTotal:number = 0; let totalWeight:number = 0;

    for(const assessment of assessments){
        if(assessment.grade === null){continue;};
        const {grade,weight}=assessment;
        if(!Number.isFinite(grade)||grade>10||grade<0||!Number.isFinite(weight)||weight>10||weight<10){
            throw new Error("invalid assessment values");
        }
        const gradeInCents = Math.round(grade*100);
        weightedTotal+=gradeInCents*weight;
        totalWeight+=weight;
        if(totalWeight===0){return null};
    }
        return Math.round((weightedTotal/totalWeight)/100);
}