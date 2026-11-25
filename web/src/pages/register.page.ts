import { register } from "../services/auth.service.ts";
export function renderRegister(root: HTMLElement): void {
    root.innerHTML = `
        <section>
            <h2>Criar conta</h2>
            <form id="register-form">
                <label for="name">Nome</label>
                <input id="name" name="name"  minlength="2"  maxlength="100"  autocomplete="name" required>
                <label for="email">Email</label>
                <input  id="email" name="email" type="email" maxlength="254" autocomplete="email" required>
                <label for="password">Senha</label>
                <input id="password"  name="password" type="password" minlength="12"  maxlength="128"  autocomplete="new-password" required>
                <label for="confirmation">Confirmar senha</label>
                <input id="confirmation" name="confirmation" type="password" autocomplete="new-password" required>
                <button type="submit">Criar conta</button>
            </form>
            <p id="feedback" role="status"></p>
            <a href="#/login">Já possui uma conta? Entrar</a>
        </section>
    `;

    const form = root.querySelector<HTMLFormElement>("#register-form");
    const feedback = root.querySelector<HTMLParagraphElement>("#feedback");
    const button = root.querySelector<HTMLButtonElement>("button");

    if (!form || !feedback || !button) {
        throw new Error("Elementos do cadastro não encontrados");
    }
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") ?? "");
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");
        const confirmation =String(data.get("confirmation") ?? "");
        if (password !== confirmation) {
            feedback.textContent ="As senhas não coincidem.";
            return;
        }
        button.disabled = true;
        feedback.textContent = "Criando conta...";
        try {
            await register({name,email,password});
            form.reset();
            if (root.isConnected) {
                window.location.hash = "/login";
            }
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Não foi possível criar a conta.";
        } finally {
            button.disabled = false;
        }
    });
}