import { readMeta } from "./meta";

export function getDashboardUrl(): string {
    // meta[name="dashboard-url"] ska innehålla en URL/relativ URL till dashboard-sidan
    return readMeta("dashboard-url", "");
}

export function getProjectsUrl(): string {
    // meta[name="projects-url"] ska innehålla URL till projects-sidan
    return readMeta("projects-url", "/");
}

export function getProjectIdFromUrl(): string | null {
    const url = new URL(window.location.href);
    const pid = url.searchParams.get("projectId");
    if (!pid || pid === "undefined" || pid === "null") return null;
    return pid;
}

export function goToProject(projectId: string) {
    const base = getDashboardUrl();
    if (!base) {
        // här vill vi ha ett tydligt fel när CMS-meta saknas
        throw new Error('Missing meta "dashboard-url". Set ProjectsPage.ProjectDashboardPage in CMS.');
    }

    const url = new URL(base, window.location.origin);
    url.searchParams.set("projectId", projectId);
    window.location.href = url.toString();
}

export function goToProjects() {
    const url = getProjectsUrl() || "/";
    window.location.href = url;
}

export function getLinkValidationToolUrl(): string {
    // Länkvaliderings-verktyget är tillgängligt via app-page=link-validation meta-tag
    const baseUrl = new URL(window.location.href).origin;
    return `${baseUrl}/?app-page=link-validation`;
}

