import {listActivities,createActivity,updateActivity,deleteActivity} from "../services/activities.service.ts";
import { listSubjects } from "../services/subject.services.ts";
import { populateSubjectSelect } from "../components/subject-select.ts";
import {toIsoDate,formatDate,toLocalDateTimeInput} from "../utils/dates.ts";
import type {Activity,ActivityStatus,CreateActivityInput} from "../types/activity.ts";
import { requireElement } from "../utils/dom.ts";

export async function renderActivities(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2>Gerenciar atividades</h2>
            <form id="activity-form">
                <label for="subject">Disciplina</label>
                <select id="subject" name="subjectId" required>
                </select>
                <label for="name">Nome</label>
                <input id="name" name="name" maxlength="150" required>
                <label for="description">Descrição</label>
                <textarea id="description" name="description" maxlength="2000"></textarea>
                <label for="dueAt">Prazo</label>
                <input id="dueAt" name="dueAt" type="datetime-local" required>
                <label for="status">Status</label>
                <select id="status" name="status">
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="completed">Concluída</option>
                </select>
                <button type="submit" id="save-button">Salvar atividade</button>
                <button type="button" id="cancel-button" hidden>Cancelar edição</button>
            </form>
            <p id="feedback" role="status"></p>
        </section>
        <section>
            <h2>Minhas atividades</h2>
            <ul id="activities-list"></ul>
        </section>
        <label for="status-filter">Filtrar por status</label>
        <select id="status-filter">
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluídas</option>
        </select>
    `;
const form = requireElement<HTMLFormElement>(root, "#activity-form");
const subjectSelect = requireElement<HTMLSelectElement>(root, "#subject");
const nameInput = requireElement<HTMLInputElement>(root, "#name");
const descriptionInput = requireElement<HTMLTextAreaElement>(root, "#description");
const dueAtInput = requireElement<HTMLInputElement>(root, "#dueAt");
const statusSelect = requireElement<HTMLSelectElement>(root, "#status");
const feedback = requireElement<HTMLParagraphElement>(root, "#feedback");
const list = requireElement<HTMLUListElement>(root, "#activities-list");
const saveButton = requireElement<HTMLButtonElement>(root, "#save-button");
const cancelButton = requireElement<HTMLButtonElement>(root, "#cancel-button");
const statusFilter = requireElement<HTMLSelectElement>(root, "#status-filter");

const subjects = await listSubjects();
populateSubjectSelect(subjectSelect, subjects);

async function loadActivities(): Promise<void> {
    activities = await listActivities();
    renderActivityList();
}

function renderActivityList(): void {
    list.replaceChildren();
    if (activities.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Nenhuma atividade cadastrada.";
        list.appendChild(empty);
        return;
    }
    const subjectNames = new Map(
        subjects.map(subject => [
            subject.id,
            subject.name
        ])
    );
    for (const activity of activities) {
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => {startEditing(activity);});
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", () => {void removeActivity(activity);});
        const item = document.createElement("li");
        item.append(editButton, deleteButton);
        const title = document.createElement("h3");
        const subject = document.createElement("p");
        const date = document.createElement("p");
        const description = document.createElement("p");
        title.textContent = activity.name;
        subject.textContent =subjectNames.get(activity.subjectId)?? "Disciplina indisponível";
        date.textContent = formatDate(activity.dueAt);
        description.textContent = activity.description ?? "Sem descrição";
        item.append(title,subject,description,date);
        list.appendChild(item);
    }
    cancelButton.addEventListener("click", resetForm);
    resetForm();
    setBusy(false);
    if (subjects.length === 0) {
        feedback.textContent =
            "Cadastre uma disciplina antes de criar atividades.";
    }
    await loadActivities();
}
    function readForm(): CreateActivityInput {
    const name = nameInput.value.trim();
    if (!name) {
        throw new Error("Informe o nome da atividade.");
    }
    if (!subjectSelect.value) {
        throw new Error("Selecione uma disciplina.");
    }
    const status = statusSelect.value;
    if (status !== "pending" && status !== "in_progress" && status !== "completed"
    ) {
        throw new Error("Status inválido.");
    }
    return {
        subjectId: subjectSelect.value,
        name,
        description:descriptionInput.value.trim() || null,
        dueAt: toIsoDate(dueAtInput.value),
        status
        };
    }
    function setBusy(value: boolean): void {
    busy = value;
    saveButton.disabled = value || subjects.length === 0;
    cancelButton.disabled = value;
    }
    function resetForm(): void {
    editingActivityId = null;
    form.reset();
    saveButton.textContent = "Salvar atividade";
    cancelButton.hidden = true;
    }
    form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
        const data = readForm();
        if (editingActivityId === null) {
            await createActivity(data);
            feedback.textContent ="Atividade cadastrada.";
        } else {
            await updateActivity(editingActivityId,data);
            feedback.textContent ="Atividade atualizada.";
        }
        resetForm();
        await loadActivities();
    } catch (error) {
        feedback.textContent =error instanceof Error? error.message: "Não foi possível salvar a atividade.";
    } finally {
        setBusy(false);
    }
    });
    function startEditing(activity: Activity): void {
    if (busy) return;
    editingActivityId = activity.id;
    subjectSelect.value = activity.subjectId;
    nameInput.value = activity.name;
    descriptionInput.value =activity.description ?? "";
    dueAtInput.value =toLocalDateTimeInput(activity.dueAt);
    statusSelect.value = activity.status;
    saveButton.textContent = "Atualizar atividade";
    cancelButton.hidden = false;
    nameInput.focus();
    }
    async function removeActivity(activity: Activity): Promise<void> {
    if (busy) return;
    const confirmed = window.confirm(`Excluir "${activity.name}"?`);
    if (!confirmed) return;
    setBusy(true);
    try {
        await deleteActivity(activity.id);
        if (editingActivityId === activity.id) {
            resetForm();
        }
        feedback.textContent ="Atividade excluída.";
        await loadActivities();
    } catch (error) {
        feedback.textContent =error instanceof Error? error.message: "Erro ao excluir atividade.";
    } finally {
        setBusy(false);
    }
    }
    async function changeStatus(id: string,status: ActivityStatus): Promise<void> {
    if (busy) return;
    setBusy(true);
    try {
        await updateActivity(id, { status });
        if (editingActivityId === id) {
            resetForm();
        }
        feedback.textContent = "Status atualizado.";
        await loadActivities();
    } catch (error) {
        feedback.textContent =error instanceof Error? error.message: "Erro ao alterar status.";
    } finally {
        setBusy(false);
    }
    const statusButton = document.createElement("button");
    statusButton.type = "button";
    statusButton.textContent = "Marcar como concluída";
    statusButton.disabled = activity.status === "completed";
    statusButton.addEventListener("click", () => {
        void changeStatus(activity.id,"completed");});
    item.appendChild(statusButton);
}
    function getFilteredActivities(): Activity[] {
        const status = statusFilter.value;
        return activities.filter(activity => {return status === "all"|| activity.status === status;
        });
    }
}
