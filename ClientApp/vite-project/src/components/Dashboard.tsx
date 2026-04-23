import { useEffect, useState } from "react";
import "./kanban/kanban.css";
import { Board } from "./kanban/Board";
import { ShareModal } from "./kanban/ShareModal";
import { getProjects, type Project } from "../api/projects";
import { DashboardActions } from "../components/DashboardActions";
import { DashboardTitle } from "../components/DashboardTitle";
import { getShareModalTexts } from "../cms/projectDashboardCms";

export default function Dashboard({ projectId }: { projectId: string }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const shareTexts = getShareModalTexts();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const ps = await getProjects();
        if (!alive) return;
        setProject(ps.find((p) => p.Id === projectId) ?? null);
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId]);

  return (
    <>
      <DashboardTitle title={project?.Name ?? ""} />
      <DashboardActions onShare={() => setShareOpen(true)} />
      <Board projectId={projectId} />

      {shareOpen ? (
        <ShareModal
          projectId={projectId}
          onClose={() => setShareOpen(false)}
          texts={shareTexts}
        />
      ) : null}
    </>
  );
}
