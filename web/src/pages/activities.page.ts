import {listActivities,createActivity,updateActivity,deleteActivity} from "../services/activities.service.ts";
import { listSubjects } from "../services/subject.services.ts";
import { populateSubjectSelect } from "../components/subject-select.ts";
import {toIsoDate,formatDate,toLocalDateTimeInput} from "../utils/dates.ts";
import type {Activity,ActivityStatus,CreateActivityInput} from "../types/activity.ts";

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
    `;
}