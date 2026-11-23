import "./style.css";
import {apiFetch,setAccessToken} from "./api.ts";

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
  const response = await apiFetch("/subjects");
  const subjects = response as Subject[];
  subjectsList.replaceChildren();
  for (const subject of subjects) {
    const item = document.createElement("li");
    item.textContent = subject.name;
    subjectsList.appendChild(item);
  }
}
loginForm.addEventListener("submit",async (event)=>{
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      const response = await apiFetch(
        "/auth/login",{
          method: "POST",
          body: JSON.stringify({email,password})
        });
      const login = response as LoginResponse;
      setAccessToken(login.accessToken);
      await loadSubjects();
      showMessage("Login realizado.");
    } catch {
      showMessage("Não foi possível realizar o login.");
    }
  }
);
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
