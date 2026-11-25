form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const confirmation =
        String(data.get("confirmation") ?? "");
    if (password !== confirmation) {
        feedback.textContent = "As senhas não coincidem.";
        return;
    }
    try {
        await register({name,email,password});
        loginForm.reset();
        window.location.hash = "/login";
    } catch (error) {
        feedback.textContent =
            error instanceof Error
                ? error.message
                : "Não foi possível criar a conta.";
    }
});