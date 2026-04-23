import { apiJson, apiVoid } from "./API";

export type TaskStatus = "ToDo" | "InProgress" | "Done";

export type Task = {
  Id: string;
  Title: string;
  Description?: string | null;
  Status: TaskStatus;
  Priority: number;
  CreatedAtUtc: string;
  LastChangedByUserId?: string | null;
  ProjectId: string;
  AssigneeUserIds: string[];
};

function requireProjectId(projectId: string) {
  if (!projectId || projectId === "undefined" || projectId === "null") {
    throw new Error("Invalid projectId passed to tasks API: " + String(projectId));
  }
}

export async function reorderTasks(
  projectId: string,
  status: TaskStatus,
  orderedTaskIds: string[]
): Promise<void> {
  requireProjectId(projectId);

  //  Backend returnerar 400 om OrderedTaskIds är tomt.
  // När en kolumn blir tom (t.ex. flyttar sista kortet), finns inget att reorder:a.
  if (!orderedTaskIds || orderedTaskIds.length === 0) return;

  await apiVoid(`/projects/${projectId}/tasks/reorder`, {
    method: "PUT",
    body: JSON.stringify({ Status: status, OrderedTaskIds: orderedTaskIds }),
  });
}

export async function getTasks(projectId: string): Promise<Task[]> {
  requireProjectId(projectId);
  return await apiJson<Task[]>(`/projects/${projectId}/tasks`);
}

export async function createTask(
  projectId: string,
  input: { Title: string; Description?: string | null }
): Promise<Task> {
  requireProjectId(projectId);

  return await apiJson<Task>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ Title: input.Title, Description: input.Description ?? null }),
  });
}

export async function updateTask(
  projectId: string,
  taskId: string,
  input: {
    Title: string;
    Description?: string | null;
    Status: TaskStatus;
    Priority: number;
    AssigneeUserIds: string[];
  }
): Promise<Task> {
  requireProjectId(projectId);
  if (!taskId) throw new Error("updateTask called with empty taskId");

  return await apiJson<Task>(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({
      Title: input.Title,
      Description: input.Description ?? null,
      Status: input.Status,
      Priority: input.Priority,
      AssigneeUserIds: input.AssigneeUserIds ?? [],
    }),
  });
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  requireProjectId(projectId);
  if (!taskId) throw new Error("deleteTask called with empty taskId");

  await apiVoid(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
}
