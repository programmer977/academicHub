import { listDeadlines } from "../services/deadlines.service.ts";
import { requireElement } from "../utils/dom.ts";
import { formatDate } from "../utils/dates.ts";
import {getDeadlineStatus,type DeadlineStatus} from "../utils/deadlines.ts";

export async function renderDeadlines(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2>Prazos acadêmicos</h2>
            <ul id="deadlines-list">
                <li>Carregando prazos...</li>
            </ul>
        </section>
    `;
    const list = requireElement<HTMLUListElement>(root, "#deadlines-list");
    const deadlines = await listDeadlines();
    const labels: Record<DeadlineStatus, string> = {
        overdue: "Atrasado",
        urgent: "Urgente",
        upcoming: "Próximo",
        future: "Futuro"
    };
    list.replaceChildren();
    if (deadlines.length === 0) {
        const empty = document.createElement("li");
        empty.textContent ="Nenhum prazo pendente.";
        list.appendChild(empty);
        return;
    }
    const now = Date.now();
    for (const deadline of deadlines) {
        const item = document.createElement("li");
        const title = document.createElement("h3");
        const type = document.createElement("p");
        const date = document.createElement("p");
        const status = document.createElement("span");
        const deadlineStatus = getDeadlineStatus(deadline.dueAt,now
        );
        title.textContent = deadline.title;
        type.textContent =deadline.type === "activity"? "Atividade": "Avaliação";
        date.textContent =formatDate(deadline.dueAt);
        status.textContent =labels[deadlineStatus];
        status.classList.add("badge",`badge--${deadlineStatus}`);
        item.append(title, type, date, status);
        list.appendChild(item);
    }
}