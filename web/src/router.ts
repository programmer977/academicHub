import {isAuthenticated,clearSession} from "./core/session.ts";
import { renderLogin } from "./pages/login.page.ts";
import { renderRegister } from "./pages/register.page.ts";
import { renderDashboard } from "./pages/dashboard.page.ts";
import { renderSubjects } from "./pages/subject.pages.ts";
import { renderActivities } from "./pages/activities.page.ts";
import {renderSubjectDetail} from "./pages/subject.detail.page.ts";
import {renderAssessments} from "./pages/assessments.page.ts";
import {renderDeadlines} from "./pages/deadlines.page.ts";

type PageRenderer = (root: HTMLElement) => void | Promise<void>;
const routes = new Map<string, PageRenderer>([
    ["/login", renderLogin],
    ["/register", renderRegister],
    ["/dashboard", renderDashboard],
    ["/subjects", renderSubjects],
    ["/activities", renderActivities],
    ["/assessments", renderAssessments],
    ["/deadlines", renderDeadlines]
]);

export async function router(): Promise<void> {
    const app = document.querySelector<HTMLElement>("#app");
    if (!app) {
        throw new Error("Main application element not found");
    }
    const path =window.location.hash.slice(1) || "/dashboard";
    const publicRoute =path === "/login" || path === "/register";
    const authenticated = isAuthenticated();
    if (!publicRoute && !authenticated) {
        app.replaceChildren();
        window.location.hash = "/login";
        return;
    }
    if (publicRoute && authenticated) {
        window.location.hash = "/dashboard";
        return;
    }
    let render = routes.get(path);
    const subjectMatch = path.match(
        /^\/subjects\/([^/]+)$/
    );
    const subjectId = subjectMatch?.[1];
    if (!render && subjectId) {
        render = root =>renderSubjectDetail(root, subjectId);
    }
    if (!render) {
        window.location.hash = "/dashboard";
        return;
    }
    app.replaceChildren();
    if (authenticated) {
        const nav = document.createElement("nav");
        nav.innerHTML = `
                <a href="#/dashboard">Dashboard</a>
                <a href="#/subjects">Subjects</a>
                <a href="#/activities">Activities</a>
                <a href="#/assessments">Assessments</a>
                <a href="#/deadlines">Deadlines</a>

                <button type="button" id="logout-button">
                    Log out
                </button>
            `;
        const logoutButton =nav.querySelector<HTMLButtonElement>("#logout-button");
        logoutButton?.addEventListener("click", () => {
            clearSession();
            app.replaceChildren();
            window.location.hash = "/login";
        });
        app.appendChild(nav);
    }
    const page = document.createElement("div");
    app.appendChild(page);
    try {
        await render(page);
    } catch (error) {
        if (page.isConnected) {
            page.textContent =error instanceof Error? error.message: "Unable to load the page.";
        }
    }
}