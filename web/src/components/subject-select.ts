import type { Subject } from "../types/subject.ts";

export function populateSubjectSelect(select: HTMLSelectElement,subjects: Subject[]): void {
    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a subject";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    for (const subject of subjects) {
        const option = document.createElement("option");
        option.value = subject.id;
        option.textContent = subject.name;
        select.appendChild(option);
    }
}