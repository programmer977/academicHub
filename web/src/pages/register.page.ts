import { register } from "../services/auth.service.ts";
export function renderRegister(root: HTMLElement): void {
    root.innerHTML = `
        <section>
            <h2>Create account</h2>
            <form id="register-form">
                <label for="name">Name</label>
                <input id="name" name="name"  minlength="2"  maxlength="100"  autocomplete="name" required>
                <label for="email">Email</label>
                <input  id="email" name="email" type="email" maxlength="254" autocomplete="email" required>
                <label for="password">Password</label>
                <input id="password"  name="password" type="password" minlength="12"  maxlength="128"  autocomplete="new-password" required>
                <label for="confirmation">Confirm password</label>
                <input id="confirmation" name="confirmation" type="password" autocomplete="new-password" required>
                <button type="submit">Create account</button>
            </form>
            <p id="feedback" role="status"></p>
            <a href="#/login">Already have an account? Log in</a>
        </section>
    `;

    const form = root.querySelector<HTMLFormElement>("#register-form");
    const feedback = root.querySelector<HTMLParagraphElement>("#feedback");
    const button = root.querySelector<HTMLButtonElement>("button");

    if (!form || !feedback || !button) {
        throw new Error("Registration form elements not found");
    }
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") ?? "");
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");
        const confirmation =String(data.get("confirmation") ?? "");
        if (password !== confirmation) {
            feedback.textContent ="Passwords do not match.";
            return;
        }
        button.disabled = true;
        feedback.textContent = "Creating account...";
        try {
            await register({name,email,password});
            form.reset();
            if (root.isConnected) {
                window.location.hash = "/login";
            }
        } catch (error) {
            feedback.textContent =error instanceof Error? error.message: "Unable to create the account.";
        } finally {
            button.disabled = false;
        }
    });
}