import {getProfile} from "../services/auth.service.ts";
import {listSubjects} from "../services/subject.services.ts";

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
    const [user, subjects] = await Promise.all([getProfile(),listSubjects()
    ]);
    welcome.textContent = `Bem-vindo, ${user.name}`;
    subjectCount.textContent = String(subjects.length);
    for (const subject of subjects) {
        const item = document.createElement("li");
        item.textContent = subject.name;
        subjectsList.appendChild(item);
    }
}