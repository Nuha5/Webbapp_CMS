// group/sort/find helpers

import type { Task, TaskStatus } from "../../../api/tasks";
import { isStatus } from "./config";

export function groupTasks(tasks: Task[]): Record<TaskStatus, Task[]> {
  const map: Record<TaskStatus, Task[]> = { ToDo: [], InProgress: [], Done: [] };

  for (const t of tasks) {
    if (t.Status === "ToDo" || t.Status === "InProgress" || t.Status === "Done") {
      map[t.Status].push(t);
    } else {
      map.ToDo.push({ ...t, Status: "ToDo" });
    }
  }

  for (const s of Object.keys(map) as TaskStatus[]) {
    map[s].sort((a, b) => {
      const prioA = a.Priority ?? 0;
      const prioB = b.Priority ?? 0;
      if (prioA !== prioB) return prioA - prioB;
      // Match backend normalization: use CreatedAtUtc as tiebreaker
      const timeA = Date.parse(a.CreatedAtUtc);
      const timeB = Date.parse(b.CreatedAtUtc);
      return timeA - timeB;
    });
  }

  return map;
}

export function findTask(tasks: Task[], id: string): Task | undefined {
  return tasks.find((t) => t.Id === id);
}

export function findContainer(tasks: Task[], id: string): TaskStatus | null {
  if (isStatus(id)) return id;
  const t = findTask(tasks, id);
  return t ? t.Status : null;
}

