import {getSubject,getSubjectAverage} from "../services/subject.services.ts";
import {listActivities} from "../services/activities.service.ts";
import {listAssessments} from "../services/assessment.service.ts";
import {requireElement} from "../utils/dom.ts";
import {formatDate} from "../utils/dates.ts";

export async function renderSubjectDetail(root: HTMLElement,subjectId: string): Promise<void> {
    root.innerHTML = `
        <section>
            <a href="#/subjects">Back</a>
            <h2 id="subject-name">Loading...</h2>
            <p id="subject-description"></p>
            <h3>Current average</h3>
            <strong id="subject-average">...</strong>
        </section>
        <section>
            <h2>Activities</h2>
            <ul id="activities-list"></ul>
        </section>
        <section>
            <h2>Assessments</h2>
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
        description.textContent =subject.description ?? "No description.";
        averageElement.textContent =average === null? "No graded assessments yet.": average.toFixed(2);
        const activitiesList =requireElement<HTMLUListElement>(root, "#activities-list");
        for (const activity of subjectActivities) {
            const item = document.createElement("li");
            item.textContent =`${activity.name} — ${formatDate(activity.dueAt)}`;
            activitiesList.appendChild(item);
        }
        if (subjectActivities.length === 0) {
            const item = document.createElement("li");
            item.textContent = "No activities added yet.";
            activitiesList.appendChild(item);
        }
        const assessmentsList =requireElement<HTMLUListElement>(root, "#assessments-list");
        for (const assessment of subjectAssessments) {
            const item = document.createElement("li");
            const grade =assessment.grade === null? "Ungraded": assessment.grade.toFixed(2);
            item.textContent =`${assessment.title} — ${grade} — Weight ${assessment.weight}`;
            assessmentsList.appendChild(item);
        }
        if (subjectAssessments.length === 0) {
            const item = document.createElement("li");
            item.textContent = "No assessments added yet.";
            assessmentsList.appendChild(item);
        }
}