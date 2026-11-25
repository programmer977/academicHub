import { login } from "../services/auth.service.ts";
import { setAccessToken } from "../core/session.ts";

export function renderLogin(root: HTMLElement): void {
    root.innerHTML = `
        <section>
            <h2>Entrar</h2>
            <form id="login-form">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" autocomplete="username" required>
                <label for="password">Senha</label>
                <input  id="password" name="password" type="password"  autocomplete="current-password" required>
                <button type="submit">Entrar</button>
            </form>
            <p id="feedback" role="status"></p>
            <a href="#/register">Criar uma conta</a>
        </section>
    `;
    const form =root.querySelector<HTMLFormElement>("#login-form");
    const feedback =root.querySelector<HTMLParagraphElement>("#feedback");
    const button =root.querySelector<HTMLButtonElement>("button");

    if (!form || !feedback || !button) {
        throw new Error("Elementos do login não encontrados");
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");
        button.disabled = true;
        feedback.textContent = "Autenticando...";
        try {
            const response = await login({email,password});
            if (!root.isConnected) {
                return;
            }
            setAccessToken(response.accessToken);
            form.reset();
            window.location.hash = "/dashboard";
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Falha na autenticação.";
        } finally {
            button.disabled = false;
        }
    });
}