import {getProfile} from "../services/auth.service.ts";
import {listSubjects} from "../services/subject.services.ts";
import {listActivities} from "../services/activities.service.ts";
import {listAssessments} from "../services/assessment.service.ts";
import {listDeadlines} from "../services/deadlines.service.ts";
import {getSubjectAverage} from "../services/subject.services.ts";

export async function renderDashboard(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2 id="welcome">Dashboard acadêmico</h2>
            <div class="dashboard-grid">
                <article class="card">
                    <h3>Disciplinas cadastradas</h3>
                    <strong id="subject-count">...</strong>
                </article>
            </div>
            <h3>Minhas disciplinas</h3>
            <ul id="subjects-list"></ul>
        </section>
    `;
    const welcome =root.querySelector<HTMLElement>("#welcome");
    const subjectCount =root.querySelector<HTMLElement>("#subject-count");
    const subjectsList =root.querySelector<HTMLUListElement>("#subjects-list");
    if (!welcome || !subjectCount || !subjectsList) {
        throw new Error("Elementos do Dashboard não encontrados");
    }
    const [user,subjects,activities,assessments,deadlines] = await Promise.all([
    getProfile(),
    listSubjects(),
    listActivities(),
    listAssessments(),
    listDeadlines()
]);
    welcome.textContent = `Bem-vindo, ${user.name}`;
    subjectCount.textContent = String(subjects.length);
    for (const subject of subjects) {
        const item = document.createElement("li");
        item.textContent = subject.name;
        subjectsList.appendChild(item);
    }
    const pendingActivities = activities.filter(activity => activity.status !== "completed").length;
    const completedActivities = activities.filter(activity => activity.status === "completed").length;
    const pendingAssessments = assessments.filter(assessment => assessment.grade === null).length;
    const now = Date.now();
    const overdueActivities = activities.filter(activity =>activity.status !== "completed" && new Date(activity.dueAt).getTime() < now).length;
    const completionRate =activities.length === 0? 0: completedActivities / activities.length * 100;
    const upcomingDeadlines = deadlines.filter(deadline =>new Date(deadline.dueAt).getTime() >= now).slice(0, 5);
    const subjectAverages = await Promise.all(
    subjects.map(async subject => {
        const average = await getSubjectAverage(subject.id);
        return {subjectId: subject.id,subjectName: subject.name,average};
    })
);
}