import { useEffect, useMemo, useRef, useState } from "react";
import type { Task, TaskStatus } from "../../../api/tasks";
import { createTask, deleteTask, getTasks, updateTask, reorderTasks } from "../../../api/tasks";
import { groupTasks } from "./selectors";
import { useProjectRealtime } from "../../../realtime/useProjectRealtime";
import { toUiError } from "../../../api/errors";

export function useBoardTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Initial load
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getTasks(projectId);
        if (alive) setTasks(data);
      } catch (e) {
        if (alive) setError(toUiError(e, "Failed to load tasks"));
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId]);

  const grouped = useMemo(() => groupTasks(tasks), [tasks]);

  async function reload() {
    const fresh = await getTasks(projectId);
    setTasks(fresh);
  }

  // SignalR reload (skip when syncing)
  const syncingRef = useRef(syncing);
  useEffect(() => {
    syncingRef.current = syncing;
  }, [syncing]);

  useProjectRealtime(projectId, () => {
    if (syncingRef.current) return;
    reload().catch(() => { });
  });

  async function persistColumn(status: TaskStatus, ordered: Task[]) {
    setError(null);
    setSyncing(true);

    try {
      const normalized = ordered.map((t, i) => ({ ...t, Status: status, Priority: i + 1 }));

      // optimistic UI
      const byId = new Map(normalized.map((t) => [t.Id, t]));
      setTasks((prev) =>
        prev.map((t) => {
          const u = byId.get(t.Id);
          return u ? { ...t, Status: u.Status, Priority: u.Priority } : t;
        })
      );

      //  Om kolumnen är tom -> skippa reorder (backend skickar annars 400)
      const ids = normalized.map((t) => t.Id);
      if (ids.length > 0) {
        await reorderTasks(projectId, status, ids);
      }

      // hard sync (gäller även när ids.length === 0)
      setTasks(await getTasks(projectId));
    } catch (e) {
      setError(toUiError(e, "Reorder failed"));
      try {
        setTasks(await getTasks(projectId));
      } catch { }
    } finally {
      setSyncing(false);
    }
  }

  async function onCreate(input: { Title: string; Description?: string | null; Status: TaskStatus }) {
    setError(null);
    setSyncing(true);

    try {
      const created = await createTask(projectId, {
        Title: input.Title,
        Description: input.Description ?? null,
      });

      const currentList = grouped[input.Status] ?? [];
      const nextPriority = (currentList[currentList.length - 1]?.Priority ?? 0) + 1;

      const finalTask = await updateTask(projectId, created.Id, {
        Title: created.Title,
        Description: created.Description ?? null,
        Status: input.Status,
        Priority: nextPriority,
        AssigneeUserIds: created.AssigneeUserIds ?? [],
      });

      setTasks((prev) => [finalTask, ...prev]);
    } catch (e) {
      setError(toUiError(e, "Create failed"));
    } finally {
      setSyncing(false);
    }
  }

  async function onUpdate(
    id: string,
    patch: {
      Title: string;
      Description?: string | null;
      Status: TaskStatus;
      Priority?: number;
      AssigneeUserIds?: string[];
    }
  ) {
    setError(null);
    setSyncing(true);

    const current = tasks.find((t) => t.Id === id);
    if (!current) {
      setSyncing(false);
      return;
    }

    const nextPriority = patch.Priority ?? current.Priority;
    const nextAssignees = patch.AssigneeUserIds ?? current.AssigneeUserIds ?? [];

    // optimistic
    const optimistic: Task = {
      ...current,
      Title: patch.Title,
      Description: patch.Description ?? null,
      Status: patch.Status,
      Priority: nextPriority,
      AssigneeUserIds: nextAssignees,
    };

    setTasks((prev) => prev.map((t) => (t.Id === id ? optimistic : t)));

    try {
      const updated = await updateTask(projectId, id, {
        Title: patch.Title,
        Description: patch.Description ?? null,
        Status: patch.Status,
        Priority: nextPriority,
        AssigneeUserIds: nextAssignees,
      });

      setTasks((prev) => prev.map((t) => (t.Id === id ? updated : t)));
    } catch (e) {
      setTasks((prev) => prev.map((t) => (t.Id === id ? current : t)));
      setError(toUiError(e, "Update failed"));
    } finally {
      setSyncing(false);
    }
  }

  async function onDelete(id: string) {
    setError(null);
    setSyncing(true);

    const before = tasks;
    const deleted = tasks.find((t) => t.Id === id);
    if (!deleted) {
      setSyncing(false);
      return;
    }

    const status = deleted.Status;

    const remaining = tasks.filter((t) => t.Id !== id);
    setTasks(remaining);

    try {
      await deleteTask(projectId, id);

      const col = remaining
        .filter((t) => t.Status === status)
        .sort((a, b) => (a.Priority ?? 0) - (b.Priority ?? 0));

      await persistColumn(status, col);
    } catch (e) {
      setTasks(before);
      setError(toUiError(e, "Delete failed"));
    } finally {
      setSyncing(false);
    }
  }

  return {
    tasks,
    setTasks,
    grouped,
    error,
    setError,
    syncing,
    setSyncing,
    reload,
    persistColumn,
    onCreate,
    onUpdate,
    onDelete,
  };
}
