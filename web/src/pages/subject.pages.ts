import {listSubjects,createSubject,updateSubject,deleteSubject} from "../services/subject.services.ts";
import type { Subject } from "../types/subject.ts";

export async function renderSubjects(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2>My subjects</h2>
            <form id="subject-form">
                <label for="name">Name</label>
                <input id="name" name="name" maxlength="120" required>
                <label for="description">Description</label>
                <textarea id="description" name="description"  maxlength="1200"></textarea>
                <button type="submit" id="save-button">Save subject</button>
                <button type="button" id="cancel-button">Cancel editing</button>
            </form>
            <p id="feedback" role="status"></p>
        </section>
        <section>
            <h2>Saved subjects</h2>
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
    {throw new Error("Page elements not found");}
    let editingSubjectId: string | null = null;
    let busy = false;

    function setBusy(value: boolean): void {
    busy = value;
    saveButton!.disabled = value;
    cancelButton!.disabled = value;
    nameInput!.disabled = value;
    descriptionInput!.disabled = value;
    subjectsList!.querySelectorAll<HTMLButtonElement>("button").forEach(button => {button.disabled = value;});
}
    function resetForm(): void {
        editingSubjectId = null;
        form!.reset();
        saveButton!.textContent = "Save subject";
        cancelButton!.hidden = true;
    }
    function startEditing(subject: Subject): void {
        if (busy) return;
        editingSubjectId = subject.id;
        nameInput!.value = subject.name;
        descriptionInput!.value =subject.description ?? "";
        saveButton!.textContent = "Update subject";
        cancelButton!.hidden = false;
        nameInput!.focus();
    }
    async function removeSubject(subject: Subject): Promise<void> {
        if (busy) return;
        const confirmed = window.confirm(`Delete "${subject.name}" and all its activities and assessments?`);
        if (!confirmed) return;
        setBusy(true);
        try {
            await deleteSubject(subject.id);
            if (editingSubjectId === subject.id) {
                resetForm();
            }
            feedback!.textContent = "Subject deleted.";
            await loadSubjects();
        } catch (error) {
            feedback!.textContent =error instanceof Error? error.message: "Unable to delete the subject.";
        } finally {
            setBusy(false);
        }
    }
    function renderSubject(subject: Subject): void {
        const detailLink = document.createElement("a");
        detailLink.href =`#/subjects/${subject.id}`;
        detailLink.textContent ="View subject";
        const item = document.createElement("li");
        const title = document.createElement("h3");
        const description = document.createElement("p");
        const editButton = document.createElement("button");
        const deleteButton = document.createElement("button");
        title.textContent = subject.name;
        description.textContent =subject.description ?? "No description";
        editButton.textContent = "Edit";
        editButton.type = "button";
        deleteButton.textContent = "Delete";
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
        loading.textContent = "Loading subjects...";
        subjectsList!.appendChild(loading);
        try {
            const subjects = await listSubjects();
            subjectsList!.replaceChildren();
            if (subjects.length === 0) {
                const empty = document.createElement("li");
                empty.textContent ="No subjects added yet.";
                subjectsList!.appendChild(empty);
                return;
            }
            for (const subject of subjects) {
                renderSubject(subject);
            }
        } catch {
            loading.textContent ="Unable to load subjects.";
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
            feedback.textContent ="Enter the subject name.";
            return;
        }
        setBusy(true);
        try {
            if (editingSubjectId === null) {
                await createSubject(data);
                feedback.textContent ="Subject created.";
            } else {
                await updateSubject(
                    editingSubjectId,
                    data
                );
                feedback.textContent ="Subject updated.";
            }
            resetForm();
            await loadSubjects();
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Unable to save the subject.";
        } finally {

            setBusy(false);
        }
    });
    cancelButton.addEventListener("click", resetForm);
    resetForm();
    setBusy(true);
    try {await loadSubjects();} finally {setBusy(false);}
}