import "./style.css";
import {apiFetch,setAccessToken} from "./core/api.ts";
import "./styles/global.css";
import { router } from "./router.ts";
import { login } from "../services/auth.service.ts";
import {setAccessToken} from "../core/session.ts";
import { listSubjects,deleteSubject } from "./services/subject.services.ts";

function renderRoute(): void {
    void router().catch(console.error);
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("session-expired", () => {
    window.location.hash = "/login";
});

renderRoute();

type Subject = {
  id: string;
  name: string;
  description: string | null;
};
type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

const loginForm =document.querySelector<HTMLFormElement>("#login-form")!;
const subjectForm =document.querySelector<HTMLFormElement>("#subject-form")!;
const subjectsList =document.querySelector<HTMLUListElement>("#subjects-list")!;
const feedback =document.querySelector<HTMLParagraphElement>("#feedback")!;

if (!loginForm ||!subjectForm ||!subjectsList ||!feedback) {
  throw new Error("Required interface elements were not found");
}

function showMessage(message: string): void {
  feedback.textContent = message;
}
async function loadSubjects(): Promise<void> {
    const subjects = await listSubjects();
    subjectsList.replaceChildren();
    if (subjects.length === 0) {
        subjectsList.textContent ="Nenhuma disciplina cadastrada.";
        return;
    }

    for (const subject of subjects) {
        const item = document.createElement("li");
        const title = document.createElement("h3");
        title.textContent = subject.name;
        const description = document.createElement("p");
        description.textContent = subject.description ?? "Sem descrição.";
        item.append(title, description);
        subjectsList.appendChild(item);
    }
}
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
        const response = await login({email,password
        });
        setAccessToken(response.accessToken);
        loginForm.reset();
        window.location.hash = "/dashboard";
    } catch (error) {
        feedback.textContent = error instanceof Error? error.message: "Falha na autenticação.";
    }
});
subjectForm.addEventListener("submit",async (event) => {
    event.preventDefault();
    const formData = new FormData(subjectForm);
    const name = String(formData.get("name") ?? "");
    try {
      await apiFetch("/subjects", {
        method: "POST",
        body: JSON.stringify({name})
      });
      subjectForm.reset();
      await loadSubjects();
      showMessage("Disciplina cadastrada.");
    } catch {
      showMessage("Não foi possível cadastrar a disciplina.");
    }
  }
);
const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.textContent = "Excluir";
deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm("Excluir esta disciplina e todas as suas atividades e avaliações?"
    );
    if (!confirmed) return;
    try {
        await deleteSubject(subject.id);

        await loadSubjects();
    } catch (error) {
        feedback.textContent =
            "Não foi possível excluir a disciplina.";
    }
});
item.appendChild(deleteButton);
