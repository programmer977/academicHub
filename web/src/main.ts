import "./style.css";
import { router } from "./router.ts";

function renderRoute(): void {void router().catch(console.error);}
window.addEventListener("hashchange",renderRoute
);
window.addEventListener(
    "session-expired",
    () => {
        window.location.hash = "/login";
    }
);
renderRoute();