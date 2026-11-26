import {getProfile} from "../services/auth.service.ts";
import {listSubjects} from "../services/subject.services.ts";
import {listActivities} from "../services/activities.service.ts";
import {listAssessments} from "../services/assessment.service.ts";
import {listDeadlines} from "../services/deadlines.service.ts";
import {getSubjectAverage} from "../services/subject.services.ts";
import {createStatisticCard} from "../components/statistic-card.ts";
import {requireElement} from "../utils/dom.ts";
import {formatDate} from "../utils/dates.ts";

export async function renderDashboard(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2 id="welcome">Dashboard acadêmico</h2>
            <div id="statistics" class="dashboard-grid"></div>
        </section>
        <section>
            <h2>Próximos prazos</h2>
            <ul id="upcoming-deadlines"></ul>
        </section>
        <section>
            <h2>Desempenho acadêmico</h2>
            <ul id="subject-averages"></ul>
        </section>
    `;
    const welcome = requireElement<HTMLElement>(root,"#welcome");
    const statistics = requireElement<HTMLElement>(root,"#statistics");
    const deadlinesList = requireElement<HTMLUListElement>(root,"#upcoming-deadlines");
    const averagesList = requireElement<HTMLUListElement>(root,"#subject-averages");
    if (!welcome ||!statistics || !deadlinesList || !averagesList) {
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
    const pendingActivities = activities.filter(activity => activity.status !== "completed").length;
    const completedActivities = activities.filter(activity => activity.status === "completed").length;
    const pendingAssessments = assessments.filter(assessment => assessment.grade === null).length;
    const now = Date.now();
    const overdueActivities = activities.filter(activity =>activity.status !== "completed" && new Date(activity.dueAt).getTime() < now).length;
    const completionRate =activities.length === 0? 0: completedActivities / activities.length * 100;
    const upcomingDeadlines = deadlines.filter(deadline =>new Date(deadline.dueAt).getTime() >= now).slice(0, 5);
    const subjectAverages = await Promise.all(
    subjects.map(async subject => {const average = await getSubjectAverage(subject.id);
        return {subjectId: subject.id,subjectName: subject.name,average};
    }));
    statistics.append(
    createStatisticCard("Disciplinas",subjects.length),
    createStatisticCard("Atividades pendentes",pendingActivities),
    createStatisticCard("Atividades concluídas",completedActivities),
    createStatisticCard("Atividades atrasadas",overdueActivities),
    createStatisticCard("Avaliações sem nota",pendingAssessments),
    createStatisticCard("Taxa de conclusão",activities.length === 0? "Sem atividades": `${completionRate.toFixed(1)}%`)
);
for (const deadline of upcomingDeadlines) {
    const item = document.createElement("li");
    item.textContent =`${deadline.title} — ${formatDate(deadline.dueAt)}`;
    deadlinesList.appendChild(item);
}
if (upcomingDeadlines.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Nenhum próximo prazo na lista.";
    deadlinesList.appendChild(item);
}
for (const subject of subjectAverages) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const average = document.createElement("span");
    link.href = `#/subjects/${subject.subjectId}`;
    link.textContent = subject.subjectName;
    average.textContent =subject.average === null? " — Sem notas": ` — Média: ${subject.average.toFixed(2)}`;
    item.append(link, average);
    averagesList.appendChild(item);
}
if (subjectAverages.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Nenhuma disciplina cadastrada.";
    averagesList.appendChild(item);
}
}