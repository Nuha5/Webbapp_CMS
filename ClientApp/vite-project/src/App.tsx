import ProjectsPage from "./pages/ProjectsPage";
import ProjectDashboardPage from "./pages/ProjectDashboardPage";
import { readMeta } from "./ui/meta";
import { getProjectIdFromUrl, goToProjects } from "./ui/navigation";

function normalizePageKind(raw: string) {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "projects" || v === "projects-page") return "projects";
  if (v === "dashboard" || v === "project-dashboard-page") return "dashboard";
  return "projects";
}

export default function App() {
  const pageKind = normalizePageKind(readMeta("app-page", "projects"));

  if (pageKind === "projects") {
    return <ProjectsPage />;
  }

  // dashboard
  const projectId = getProjectIdFromUrl();
  if (!projectId) {
    // Om någon går in på dashboard utan projectId: skicka tillbaka
    goToProjects();
    return null;
  }

  return <ProjectDashboardPage projectId={projectId} />;
}
