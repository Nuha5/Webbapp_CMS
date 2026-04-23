import Dashboard from "../components/Dashboard";

export default function ProjectDashboardPage({ projectId }: { projectId: string }) {
  return <Dashboard projectId={projectId} />;
}

