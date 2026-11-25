import {listAssessments,createAssessment,updateAssessment,deleteAssessment} from "../services/assessment.service.ts";
import {listSubjects} from "../services/subject.services.ts";
import {populateSubjectSelect} from "../components/subject-select.ts";
import {toIsoDate,formatDate,toLocalDateTimeInput} from "../utils/dates.ts";
import {requireElement} from "../utils/dom.ts";
import type {Assessment,CreateAssessmentInput} from "../types/assessment.ts";
import type { Subject } from "../types/subject.ts";

export async function renderAssessments(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2>Gerenciar avaliações</h2>
            <form id="assessment-form">
                <label for="subject">Disciplina</label>
                <select id="subject" required></select>
                <label for="title">Título</label>
                <input id="title" maxlength="150" required>
                <label for="grade">Nota</label>
                <input id="grade" type="number" min="0" max="10" step="0.01">
                <label for="weight">Peso</label>
                <input id="weight" type="number" min="1" max="10" step="1" value="1" required>
                <label for="dueAt">Data da avaliação</label>
                <input id="dueAt" type="datetime-local" required>
                <button id="save-button" type="submit">Salvar avaliação</button>
                <button id="cancel-button" type="button" hidden>Cancelar edição</button>
            </form>
            <p id="feedback" role="status"></p>
        </section>
        <section>
            <h2>Minhas avaliações</h2>
            <ul id="assessments-list"></ul>
        </section>
    `;
const form = requireElement<HTMLFormElement>(root, "#assessment-form");
const subjectSelect = requireElement<HTMLSelectElement>(root, "#subject");
const titleInput = requireElement<HTMLInputElement>(root, "#title");
const gradeInput = requireElement<HTMLInputElement>(root, "#grade");
const weightInput = requireElement<HTMLInputElement>(root, "#weight");
const dueAtInput = requireElement<HTMLInputElement>(root, "#dueAt");
const feedback = requireElement<HTMLParagraphElement>(root, "#feedback");
const list = requireElement<HTMLUListElement>(root, "#assessments-list");
const saveButton = requireElement<HTMLButtonElement>(root, "#save-button");
const cancelButton = requireElement<HTMLButtonElement>(root, "#cancel-button");

let assessments: Assessment[] = [];
let subjects: Subject[] = [];
let editingAssessmentId: string | null = null;
let busy = false;

function readForm(): CreateAssessmentInput {
    const title = titleInput.value.trim();
    const subjectId = subjectSelect.value;
    const grade =gradeInput.value === ""? null: gradeInput.valueAsNumber;
    const weight = weightInput.valueAsNumber;
    if (title.length < 1 || title.length > 150) {
        throw new Error("Título inválido.");
    }
    if (!subjects.some(subject => subject.id === subjectId)) {
        throw new Error("Selecione uma disciplina válida.");
    }
    if (grade !== null &&(!Number.isFinite(grade) ||grade < 0 ||grade > 10 ||Math.abs(grade * 100 - Math.round(grade * 100)) >= 1e-8)) {
        throw new Error("A nota deve estar entre 0 e 10, com até duas casas decimais.");}
    if (!Number.isInteger(weight) ||weight < 1 ||weight > 10) {
        throw new Error("O peso deve ser um inteiro entre 1 e 10.");
    }
    if (!dueAtInput.value) {
        throw new Error("Informe a data da avaliação.");
    }
    return {subjectId,title,grade,weight,dueAt: toIsoDate(dueAtInput.value)};
}
function setBusy(value: boolean): void {
    busy = value;
    saveButton.disabled =value || subjects.length === 0;
    cancelButton.disabled = value;
    subjectSelect.disabled = value;
    titleInput.disabled = value;
    gradeInput.disabled = value;
    weightInput.disabled = value;
    dueAtInput.disabled = value;
    list.querySelectorAll<HTMLButtonElement>("button").forEach(button => {button.disabled = value;});
}
function renderAssessmentList(): void {
    list.replaceChildren();
    if (assessments.length === 0) {
        const empty = document.createElement("li");
        empty.textContent ="Nenhuma avaliação cadastrada.";
        list.appendChild(empty);
        return;
    }
    const subjectNames = new Map(subjects.map(subject => [subject.id,subject.name]));
    for (const assessment of assessments) {
        const item = document.createElement("li");
        const title = document.createElement("h3");
        const subject = document.createElement("p");
        const grade = document.createElement("p");
        const weight = document.createElement("p");
        const date = document.createElement("p");
        title.textContent = assessment.title;
        subject.textContent =subjectNames.get(assessment.subjectId)?? "Disciplina indisponível";
        grade.textContent =assessment.grade === null? "Nota: aguardando correção": `Nota: ${assessment.grade.toFixed(2)}`;
        weight.textContent =`Peso: ${assessment.weight}`;
        date.textContent =`Data: ${formatDate(assessment.dueAt)}`;
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Editar";
        editButton.disabled = busy;
        editButton.addEventListener("click", () => {startEditing(assessment);});
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Excluir";
        deleteButton.disabled = busy;
        deleteButton.addEventListener("click", () => {void removeAssessment(assessment);});
        item.append(title,subject,grade,weight,date,editButton,deleteButton);
        list.appendChild(item);
    }
}
async function loadAssessments(): Promise<void> {
    assessments = await listAssessments();
    renderAssessmentList();
}
function startEditing(assessment: Assessment): void {
    if (busy) return;
    editingAssessmentId = assessment.id;
    subjectSelect.value = assessment.subjectId;
    titleInput.value = assessment.title;
    gradeInput.value =assessment.grade === null? "": String(assessment.grade);
    weightInput.value =String(assessment.weight);
    dueAtInput.value =toLocalDateTimeInput(assessment.dueAt);
    saveButton.textContent = "Atualizar avaliação";
    cancelButton.hidden = false;
    feedback.textContent = "";
    titleInput.focus();
}
function resetForm(): void {
    editingAssessmentId = null;
    form.reset();
    subjectSelect.value = "";
    saveButton.textContent = "Salvar avaliação";
    cancelButton.hidden = true;
}
form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    feedback.textContent = "Salvando avaliação...";
    try {
        const data = readForm();
        let message: string;
        if (editingAssessmentId === null) {
            await createAssessment(data);
            message = "Avaliação cadastrada.";
        } else {
            await updateAssessment(editingAssessmentId,data);
            message = "Avaliação atualizada.";
        }
        resetForm();
        await refreshAfterMutation(message);
    } catch (error) {
        feedback.textContent =error instanceof Error? error.message: "Não foi possível salvar a avaliação.";
    } finally {setBusy(false);}
});
async function refreshAfterMutation(message: string): Promise<void> {
    try {
        await loadAssessments();
        feedback.textContent = message;
    } catch {
        feedback.textContent =`${message} Não foi possível atualizar a listagem.`;
    }
}
async function removeAssessment(assessment: Assessment): Promise<void> {
    if (busy) return;
    const confirmed = window.confirm(`Excluir "${assessment.title}"?`);
    if (!confirmed) return;
    setBusy(true);
    try {
        await deleteAssessment(assessment.id);
        if (editingAssessmentId === assessment.id) {
            resetForm();
        }
        await refreshAfterMutation("Avaliação excluída."
        );
    } catch (error) {
        feedback.textContent =error instanceof Error? error.message: "Erro ao excluir avaliação.";
    } finally {setBusy(false);}
}
cancelButton.addEventListener("click", () => {
    if (busy) return;
    resetForm();
    feedback.textContent = "";
});
setBusy(true);
try {
    [subjects, assessments] = await Promise.all([listSubjects(),listAssessments()]);
    populateSubjectSelect(subjectSelect, subjects);
    resetForm();
    renderAssessmentList();
    if (subjects.length === 0) {
        feedback.textContent =
            "Cadastre uma disciplina antes de criar avaliações.";
    }
} catch (error) {
    feedback.textContent =error instanceof Error? error.message: "Não foi possível carregar a página.";
} finally {
    setBusy(false);
}
}
