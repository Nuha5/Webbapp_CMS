import { useEffect, useMemo, useState } from "react";
import { createProject, deleteProject, getProjects, type Project, updateProjectResolved } from "../api/projects";
import { toUiError } from "../api/errors";

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refresh() {
        setError(null);
        try {
            setProjects(await getProjects());
        } catch (e) {
            setError(toUiError(e, "Failed to load projects"));
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    async function create(name: string) {
        const trimmed = name.trim();
        if (!trimmed) return;

        setBusy(true);
        setError(null);
        try {
            const created = await createProject({ Name: trimmed });
            setProjects((prev) => [created, ...prev]);
        } catch (e) {
            setError(toUiError(e, "Create failed"));
            throw e;
        } finally {
            setBusy(false);
        }
    }

    async function remove(projectId: string) {
        setBusy(true);
        setError(null);
        try {
            await deleteProject(projectId);
            setProjects((prev) => prev.filter((p) => p.Id !== projectId));
        } catch (e) {
            setError(toUiError(e, "Delete failed"));
            throw e;
        } finally {
            setBusy(false);
        }
    }

    async function setResolved(projectId: string, isResolved: boolean) {
        setBusy(true);
        setError(null);
        try {
            await updateProjectResolved(projectId, isResolved);
            setProjects((prev) => prev.map((p) => (p.Id === projectId ? { ...p, IsResolved: isResolved } : p)));
        } catch (e) {
            setError(toUiError(e, "Update failed"));
            throw e;
        } finally {
            setBusy(false);
        }
    }

    const sorted = useMemo(() => {
        return projects.slice().sort((a, b) => {
            if (a.IsResolved === b.IsResolved) return 0;
            return a.IsResolved ? 1 : -1;
        });
    }, [projects]);

    return { projects: sorted, busy, error, refresh, create, remove, setResolved };
}
