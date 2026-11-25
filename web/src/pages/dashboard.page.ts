export function renderDashboard(root: HTMLElement): void {
    root.innerHTML = `
        <section>
            <h2>Dashboard acadêmico</h2>
            <p>Bem-vindo ao AcademicHub.</p>
            <p>
                Gerencie suas disciplinas, atividades
                e avaliações em um único lugar.
            </p>
            <a href="#/subjects">
                Acessar minhas disciplinas
            </a>
        </section>
    `;
}