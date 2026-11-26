import {listActivities,createActivity,updateActivity,deleteActivity} from "../services/activities.service.ts";
import { listSubjects } from "../services/subject.services.ts";
import { populateSubjectSelect } from "../components/subject-select.ts";
import {toIsoDate,formatDate,toLocalDateTimeInput} from "../utils/dates.ts";
import type {Activity,ActivityStatus,CreateActivityInput} from "../types/activity.ts";
import type { Subject } from "../types/subject.ts";
import { requireElement } from "../utils/dom.ts";

export async function renderActivities(root: HTMLElement): Promise<void> {
    root.innerHTML = `
        <section>
            <h2>Manage activities</h2>
            <form id="activity-form">
                <label for="subject">Subject</label>
                <select id="subject" name="subjectId" required></select>
                <label for="name">Name</label>
                <input id="name" name="name" maxlength="150" required>
                <label for="description">Description</label>
                <textarea id="description" name="description" maxlength="2000"></textarea>
                <label for="dueAt">Due date</label>
                <input id="dueAt" name="dueAt" type="datetime-local"required>
                <label for="status">Status</label>
                <select id="status" name="status">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                </select>
                <button type="submit" id="save-button">Save activity</button>
                <button type="button" id="cancel-button" hidden>Cancel editing</button>
            </form>
            <p id="feedback" role="status"></p>
        </section>
        <section>
            <h2>My activities</h2>
            <label for="status-filter">Filter by status</label>
            <select id="status-filter">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
            </select>
            <ul id="activities-list">
                <li>Loading activities...</li>
            </ul>
        </section>
    `;
    const form = requireElement<HTMLFormElement>(root, "#activity-form");
    const subjectSelect = requireElement<HTMLSelectElement>(root, "#subject");
    const nameInput = requireElement<HTMLInputElement>(root, "#name");
    const descriptionInput =requireElement<HTMLTextAreaElement>(root, "#description");
    const dueAtInput = requireElement<HTMLInputElement>(root, "#dueAt");
    const statusSelect = requireElement<HTMLSelectElement>(root, "#status");
    const feedback = requireElement<HTMLParagraphElement>(root, "#feedback");
    const list = requireElement<HTMLUListElement>(root, "#activities-list");
    const saveButton = requireElement<HTMLButtonElement>(root, "#save-button");
    const cancelButton = requireElement<HTMLButtonElement>(root, "#cancel-button");
    const statusFilter = requireElement<HTMLSelectElement>(root, "#status-filter");
    let activities: Activity[] = [];
    let subjects: Subject[] = [];
    let editingActivityId: string | null = null;
    let busy = false;
    const statusLabels: Record<ActivityStatus, string> = {pending: "Pending",in_progress: "In progress",completed: "Completed"};
    function setBusy(value: boolean): void {
        busy = value;
        saveButton.disabled =value || subjects.length === 0;
        cancelButton.disabled = value;
        statusFilter.disabled = value;
        subjectSelect.disabled = value;
        nameInput.disabled = value;
        descriptionInput.disabled = value;
        dueAtInput.disabled = value;
        statusSelect.disabled = value;
        const buttons =list.querySelectorAll<HTMLButtonElement>("button");
        for (const button of buttons) {
            button.disabled =value || button.dataset.completed === "true";
        }
    }
    function resetForm(): void {
        editingActivityId = null;
        form.reset();
        subjectSelect.value = "";
        statusSelect.value = "pending";
        saveButton.textContent = "Save activity";
        cancelButton.hidden = true;
    }
    function readForm(): CreateActivityInput {
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const subjectId = subjectSelect.value;
        const status = statusSelect.value;
        if (name.length === 0 || name.length > 150) {
            throw new Error("The name must contain between 1 and 150 characters.");
        }
        if (description.length > 2000) {
            throw new Error("The description must not exceed 2,000 characters.");
        }
        if (!subjectId) {
            throw new Error("Select a subject.");
        }
        const subjectExists = subjects.some(subject => subject.id === subjectId);
        if (!subjectExists) {
            throw new Error("Invalid subject.");
        }
        if (status !== "pending" && status !== "in_progress" && status !== "completed") {
            throw new Error("Invalid status.");
        }
        if (!dueAtInput.value) {
            throw new Error("Enter the activity due date.");
        }
        return {subjectId,name,description: description || null,dueAt: toIsoDate(dueAtInput.value),status
        };
    }
    function getFilteredActivities(): Activity[] {
        const selectedStatus = statusFilter.value;
        return activities.filter(activity => {return (selectedStatus === "all" ||activity.status === selectedStatus);});
    }
    function renderActivityList(): void {
        const filteredActivities = getFilteredActivities();
        list.replaceChildren();
        if (filteredActivities.length === 0) {
            const empty = document.createElement("li");
            empty.textContent = activities.length === 0 ? "No activities added yet.": "No activities match the filter.";
            list.appendChild(empty);
            return;
        }
        const subjectNames = new Map(subjects.map(subject => [subject.id,subject.name])
        );
        for (const activity of filteredActivities) {
            const item = document.createElement("li");
            const title = document.createElement("h3");
            const subject = document.createElement("p");
            const description = document.createElement("p");
            const date = document.createElement("p");
            const status = document.createElement("p")
            title.textContent = activity.name;
            subject.textContent =`Subject: ${subjectNames.get(activity.subjectId)?? "Subject unavailable"}`;
            description.textContent =activity.description ?? "No description";
            date.textContent =`Due date: ${formatDate(activity.dueAt)}`;
            status.textContent =`Status: ${statusLabels[activity.status]}`;
            const editButton =document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.disabled = busy;
            editButton.addEventListener("click", () => {startEditing(activity);});
            const deleteButton =document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.disabled = busy;
            deleteButton.addEventListener("click", () => {void removeActivity(activity);});
            const statusButton =document.createElement("button");
            statusButton.type = "button";
            statusButton.textContent ="Mark as completed";
            statusButton.dataset.completed =String(activity.status === "completed");
            statusButton.disabled =busy || activity.status === "completed";
            statusButton.addEventListener("click", () => {void changeStatus(activity.id,"completed");});
            item.append(title,subject,description,date,status,editButton,deleteButton,statusButton);
            list.appendChild(item);
        }
    }
    async function loadActivities(): Promise<void> {
        activities = await listActivities();
        renderActivityList();
    }
    async function refreshAfterMutation(successMessage: string): Promise<void> {
        try {
            await loadActivities();
            feedback.textContent = successMessage;
        } catch {
            feedback.textContent =`${successMessage} ` +"However, the list could not be refreshed. " +"Reopen the activities page.";
        }
    }
    function startEditing(activity: Activity): void {
        if (busy) return;
        editingActivityId = activity.id;
        subjectSelect.value = activity.subjectId;
        nameInput.value = activity.name;
        descriptionInput.value =activity.description ?? "";
        dueAtInput.value =toLocalDateTimeInput(activity.dueAt);
        statusSelect.value = activity.status;
        saveButton.textContent = "Update activity";
        cancelButton.hidden = false;
        feedback.textContent = "";
        nameInput.focus();
    }
    async function removeActivity(activity: Activity): Promise<void> {
        if (busy) return;
        const confirmed = window.confirm(`Delete "${activity.name}"?`);
        if (!confirmed) return;
        setBusy(true);
        feedback.textContent = "Deleting activity...";
        try {
            await deleteActivity(activity.id);
            if (editingActivityId === activity.id) {
                resetForm();
            }
            await refreshAfterMutation("Activity deleted.");
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Unable to delete the activity.";
        } finally {setBusy(false);}
    }
    async function changeStatus(id: string,status: ActivityStatus): Promise<void> {
        if (busy) return;
        setBusy(true);
        feedback.textContent = "Updating status...";
        try {
            await updateActivity(id, { status });
            if (editingActivityId === id) {
                resetForm();
            }
            await refreshAfterMutation("Status updated.");
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Unable to update the status.";
        } finally {setBusy(false);}
    }
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        feedback.textContent = "Saving activity...";
        try {
            const data = readForm();
            let successMessage: string;
            if (editingActivityId === null) {
                await createActivity(data);
                successMessage = "Activity created.";
            } else {
                await updateActivity(editingActivityId,data);
                successMessage = "Activity updated.";
            }
            resetForm();
            await refreshAfterMutation(successMessage);
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Unable to save the activity.";
        } finally {setBusy(false);}
    });
    cancelButton.addEventListener("click", () => {
        if (busy) return;
        resetForm();
        feedback.textContent = "";
    });
    statusFilter.addEventListener("change", () => {
        if (busy) return;
        renderActivityList();
    });
    setBusy(true);
    try {
        subjects = await listSubjects();
        populateSubjectSelect(
            subjectSelect,
            subjects
        );
        resetForm();
        await loadActivities();
        if (subjects.length === 0) {
            feedback.textContent ="Create a subject before adding activities.";
        }
    } catch (error) {
        feedback.textContent =error instanceof Error? error.message: "Unable to load the page.";
        const errorItem = document.createElement("li");
        errorItem.textContent ="Unable to load activities.";
        list.replaceChildren(errorItem);
    } finally {setBusy(false);}
}