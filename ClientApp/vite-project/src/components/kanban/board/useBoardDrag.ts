// drag drop logik 
// använder findTask/findContainer från selectors.ts och isStatus från config.ts
import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { Task, TaskStatus } from "../../../api/tasks";
import { updateTask } from "../../../api/tasks";
import { findTask } from "./selectors";
import { isStatus } from "./config";
import { toUiError } from "../../../api/errors";

type Params = {
  projectId: string;
  tasks: Task[];
  grouped: Record<TaskStatus, Task[]>;
  syncing: boolean;
  setSyncing: (v: boolean) => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  persistColumn: (status: TaskStatus, ordered: Task[], opts?: { syncAfter?: boolean; manageSyncing?: boolean }) => Promise<void>;
  reload: () => Promise<void>;
};

function asStatus(x: unknown): TaskStatus | null {
  if (typeof x !== "string") return null;
  return isStatus(x) ? (x as TaskStatus) : null;
}

export function useBoardDrag({
  projectId,
  tasks,
  grouped,
  syncing,
  setSyncing,
  setError,
  persistColumn,
  reload,
}: Params) {
  const onDragEnd = useCallback(
    async (e: DragEndEvent) => {
      if (syncing) return;
      setSyncing(true);

      try {
        const activeId = String(e.active.id);
        const overId = e.over?.id ? String(e.over.id) : null;
        if (!overId) return;

        const activeTask = findTask(tasks, activeId);
        if (!activeTask) return;

        const activeSortable = e.active.data.current?.sortable as
          | { index: number; containerId: string }
          | undefined;

        const overSortable = e.over?.data.current?.sortable as
          | { index: number; containerId: string }
          | undefined;

        const from = asStatus(activeSortable?.containerId) ?? activeTask.Status;
        const dropOnColumn = isStatus(overId);
        const to = dropOnColumn ? (overId as TaskStatus) : asStatus(overSortable?.containerId);
        if (!to) return;

        // -------------------------
        // 1) REORDER I SAMMA KOLUMN
        // -------------------------
        if (from === to) {
          const items = grouped[to].slice();

          if (dropOnColumn) {
            const fromIndex = items.findIndex((t) => t.Id === activeId);
            if (fromIndex === -1) return;

            const next = items.slice();
            const [moved] = next.splice(fromIndex, 1);
            next.push(moved);

            await persistColumn(to, next);
            return;
          }

          const fromIndex = activeSortable?.index;
          const toIndex = overSortable?.index;

          if (typeof fromIndex !== "number" || typeof toIndex !== "number") {
            const fi = items.findIndex((t) => t.Id === activeId);
            const oi = items.findIndex((t) => t.Id === overId);
            if (fi === -1 || oi === -1) return;

            await persistColumn(to, arrayMove(items, fi, oi));
            return;
          }

          if (fromIndex === toIndex) return;

          await persistColumn(to, arrayMove(items, fromIndex, toIndex));
          return;
        }

        // -------------------------
        // 2) FLYTT MELLAN KOLUMNER
        // -------------------------
        const fromItems = grouped[from].slice().filter((t) => t.Id !== activeId);
        const toItems = grouped[to].slice();

        const movedTo: Task = { ...activeTask, Status: to };
        const nextTo = toItems.slice();

        if (dropOnColumn) {
          nextTo.push(movedTo);
        } else {
          const insertIndex =
            typeof overSortable?.index === "number"
              ? overSortable.index
              : toItems.findIndex((t) => t.Id === overId);

          if (insertIndex < 0) nextTo.push(movedTo);
          else nextTo.splice(insertIndex, 0, movedTo);
        }

        // A) Uppdatera status i DB först (så backend reorder-check passar)
        await updateTask(projectId, activeTask.Id, {
          Title: activeTask.Title,
          Description: activeTask.Description ?? null,
          Status: to,
          Priority: 0, // backend normaliserar
          AssigneeUserIds: activeTask.AssigneeUserIds ?? [],
        });

        // B) Reorder båda kolumnerna – men gör INTE GET mellan dem
        // (annars kan #2 få stale list + 400)
        await persistColumn(from, fromItems, { syncAfter: false, manageSyncing: false });
        await persistColumn(to, nextTo, { syncAfter: false, manageSyncing: false });

        // C) En enda sync på slutet
        await reload();
      } catch (err) {
        setError(toUiError(err, "Move/Reorder failed"));
        try {
          await reload();
        } catch (reloadErr) {
          setError((prev) => `${prev ?? ""}\n${toUiError(reloadErr, "Refresh failed")}`);
        }
      } finally {
        setSyncing(false);
      }
    },
    [projectId, tasks, grouped, syncing, setSyncing, setError, persistColumn, reload]
  );

  return onDragEnd;
}
