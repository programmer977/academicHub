import { isAuthenticated } from "./core/session.ts";

import { renderLogin } from "./pages/login.page.ts";
import { renderRegister } from "./pages/register.page.ts";
import { renderDashboard } from "./pages/dashboard.page.ts";
import { renderSubjects } from "./pages/subjects.page.ts";
import { renderActivities } from "./pages/activities.page.ts";
import { renderAssessments } from "./pages/assessments.page.ts";
import { renderDeadlines } from "./pages/deadlines.page.ts";
import { renderProfile } from "./pages/profile.page.ts";

type PageRenderer = () => void | Promise<void>;

const routes: Record<string, PageRenderer> = {
    "/login": renderLogin,
    "/register": renderRegister,
    "/dashboard": renderDashboard,
    "/subjects": renderSubjects,
    "/activities": renderActivities,
    "/assessments": renderAssessments,
    "/deadlines": renderDeadlines,
    "/profile": renderProfile
};

export async function router(): Promise<void> {
    const path = window.location.hash.slice(1) || "/dashboard";
    const publicRoute = path === "/login" || path === "/register";
    if (!publicRoute && !isAuthenticated()) {
        window.location.hash = "/login";
        return;
    }
    const render = routes[path];
    if (!render) {
        window.location.hash = "/dashboard";
        return;
    }
    await render();
}