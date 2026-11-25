import {getSubject,getSubjectAverage} from "../services/subject.services.ts";
import {listActivities} from "../services/activities.service.ts";
import {listAssessments} from "../services/assessment.service.ts";
import {requireElement} from "../utils/dom.ts";
import {formatDate} from "../utils/dates.ts";

export async function renderSubjectDetail(root: HTMLElement,subjectId: string): Promise<void> {
    root.innerHTML = `
        <section>
            <a href="#/subjects">Voltar</a>
            <h2 id="subject-name">Carregando...</h2>
            <p id="subject-description"></p>
            <h3>Média atual</h3>
            <strong id="subject-average">...</strong>
        </section>
        <section>
            <h2>Atividades</h2>
            <ul id="activities-list"></ul>
        </section>
        <section>
            <h2>Avaliações</h2>
            <ul id="assessments-list"></ul>
        </section>
    `;
    const [subject, average, activities, assessments] =
        await Promise.all([
            getSubject(subjectId),
            getSubjectAverage(subjectId),
            listActivities(),
            listAssessments()
        ]);
        const subjectActivities = activities.filter(activity => activity.subjectId === subjectId);
        const subjectAssessments = assessments.filter(assessment => assessment.subjectId === subjectId);
        const name = requireElement<HTMLElement>(root, "#subject-name");
        const description = requireElement<HTMLElement>(root, "#subject-description");
        const averageElement = requireElement<HTMLElement>(root, "#subject-average");
        name.textContent = subject.name;
        description.textContent =subject.description ?? "Sem descrição.";
        averageElement.textContent =average === null? "Ainda não há avaliações corrigidas.": average.toFixed(2);
        const activitiesList =requireElement<HTMLUListElement>(root, "#activities-list");
        for (const activity of subjectActivities) {
            const item = document.createElement("li");
            item.textContent =`${activity.name} — ${formatDate(activity.dueAt)}`;
            activitiesList.appendChild(item);
        }
        if (subjectActivities.length === 0) {
            const item = document.createElement("li");
            item.textContent = "Nenhuma atividade cadastrada.";
            activitiesList.appendChild(item);
        }
        const assessmentsList =requireElement<HTMLUListElement>(root, "#assessments-list");
        for (const assessment of subjectAssessments) {
            const item = document.createElement("li");
            const grade =assessment.grade === null? "Sem nota": assessment.grade.toFixed(2);
            item.textContent =`${assessment.title} — ${grade} — Peso ${assessment.weight}`;
            assessmentsList.appendChild(item);
        }
        if (subjectAssessments.length === 0) {
            const item = document.createElement("li");
            item.textContent = "Nenhuma avaliação cadastrada.";
            assessmentsList.appendChild(item);
        }
}