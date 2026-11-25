import {listSubjects,createSubject,updateSubject,deleteSubject} from "../services/subject.services.ts";
import type { Subject } from "../types/subject.ts";

export async function renderSubjects(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2>Minhas disciplinas</h2>
            <form id="subject-form">
                <label for="name">Nome</label>
                <input id="name" name="name" maxlength="120" required>
                <label for="description">Descrição</label>
                <textarea id="description" name="description"  maxlength="1200"></textarea>
                <button type="submit" id="save-button">Salvar disciplina</button>
                <button type="button" id="cancel-button">Cancelar edição</button>
            </form>
            <p id="feedback" role="status"></p>
        </section>
        <section>
            <h2>Disciplinas cadastradas</h2>
            <ul id="subjects-list"></ul>
        </section>
    `;
    const form =root.querySelector<HTMLFormElement>("#subject-form");
    const nameInput =root.querySelector<HTMLInputElement>("#name");
    const descriptionInput =root.querySelector<HTMLTextAreaElement>("#description");
    const subjectsList =root.querySelector<HTMLUListElement>("#subjects-list");
    const feedback =root.querySelector<HTMLParagraphElement>("#feedback");
    const saveButton =root.querySelector<HTMLButtonElement>("#save-button");
    const cancelButton =root.querySelector<HTMLButtonElement>("#cancel-button");

    if (!form ||!nameInput ||!descriptionInput ||!subjectsList ||!feedback ||!saveButton ||!cancelButton) 
    {throw new Error("Elementos da página não encontrados");}
    let editingSubjectId: string | null = null;
    let busy = false;

    function setBusy(value: boolean): void {
        busy = value;
        saveButton!.disabled = value;
        cancelButton!.disabled = value;
    }
    function resetForm(): void {
        editingSubjectId = null;
        form!.reset();
        saveButton!.textContent = "Salvar disciplina";
        cancelButton!.hidden = true;
    }
    function startEditing(subject: Subject): void {
        if (busy) return;
        editingSubjectId = subject.id;
        nameInput!.value = subject.name;
        descriptionInput!.value =subject.description ?? "";
        saveButton!.textContent = "Atualizar disciplina";
        cancelButton!.hidden = false;
        nameInput!.focus();
    }
    async function removeSubject(subject: Subject): Promise<void> {
        if (busy) return;
        const confirmed = window.confirm(`Excluir "${subject.name}" e todas as suas atividades e avaliações?`);
        if (!confirmed) return;
        setBusy(true);
        try {
            await deleteSubject(subject.id);
            if (editingSubjectId === subject.id) {
                resetForm();
            }
            feedback!.textContent = "Disciplina excluída.";
            await loadSubjects();
        } catch (error) {
            feedback!.textContent =error instanceof Error? error.message: "Erro ao excluir disciplina.";
        } finally {
            setBusy(false);
        }
    }
    function renderSubject(subject: Subject): void {
        const detailLink = document.createElement("a");
        detailLink.href =`#/subjects/${subject.id}`;
        detailLink.textContent ="Visualizar disciplina";
        const item = document.createElement("li");
        const title = document.createElement("h3");
        const description = document.createElement("p");
        const editButton = document.createElement("button");
        const deleteButton = document.createElement("button");
        title.textContent = subject.name;
        description.textContent =subject.description ?? "Sem descrição";
        editButton.textContent = "Editar";
        editButton.type = "button";
        deleteButton.textContent = "Excluir";
        deleteButton.type = "button";
        editButton.addEventListener("click", () => {startEditing(subject);
        });
        deleteButton.addEventListener("click", () => {
            void removeSubject(subject);
        });
        item.append(title,description,detailLink,editButton,deleteButton);
        subjectsList!.appendChild(item);
    }
    async function loadSubjects(): Promise<void> {
        subjectsList!.replaceChildren();
        const loading = document.createElement("li");
        loading.textContent = "Carregando disciplinas...";
        subjectsList!.appendChild(loading);
        try {
            const subjects = await listSubjects();
            subjectsList!.replaceChildren();
            if (subjects.length === 0) {
                const empty = document.createElement("li");
                empty.textContent ="Nenhuma disciplina cadastrada.";
                subjectsList!.appendChild(empty);
                return;
            }
            for (const subject of subjects) {
                renderSubject(subject);
            }
        } catch {
            loading.textContent ="Não foi possível carregar as disciplinas.";
        }
    }
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (busy) return;
        const data = {
            name: nameInput.value.trim(),
            description:descriptionInput.value.trim() || null
        };
        if (data.name.length === 0) {
            feedback.textContent ="Informe o nome da disciplina.";
            return;
        }
        setBusy(true);
        try {
            if (editingSubjectId === null) {
                await createSubject(data);
                feedback.textContent ="Disciplina cadastrada.";
            } else {
                await updateSubject(
                    editingSubjectId,
                    data
                );
                feedback.textContent ="Disciplina atualizada.";
            }
            resetForm();
            await loadSubjects();
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Não foi possível salvar a disciplina.";
        } finally {

            setBusy(false);
        }
    });
    cancelButton.addEventListener("click", resetForm);
    resetForm();
    await loadSubjects();
}