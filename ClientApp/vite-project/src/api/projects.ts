import { apiJson, apiVoid } from "./API";

export type ProjectApi = {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  CreatedAtUtc?: string;
  createdAtUtc?: string;
  CreatedByUserId?: string;
  createdByUserId?: string;
  IsResolved?: boolean;
};

export type Project = {
  Id: string;
  Name: string;
  CreatedAtUtc: string;
  CreatedByUserId: string;
  IsResolved: boolean;
};

export type ProjectMember = { UserId: string; Email: string; Role: string };

function normalizeProject(p: ProjectApi): Project {
  return {
    Id: p.Id ?? p.id ?? "",
    Name: p.Name ?? p.name ?? "",
    CreatedAtUtc: p.CreatedAtUtc ?? p.createdAtUtc ?? "",
    CreatedByUserId: p.CreatedByUserId ?? p.createdByUserId ?? "",
    IsResolved: p.IsResolved ?? false,
  };
}

export async function getProjects(): Promise<Project[]> {
  const data = await apiJson<ProjectApi[]>("/projects");
  return (data ?? []).map(normalizeProject).filter((p) => !!p.Id);
}

export async function createProject(input: { Name: string }): Promise<Project> {
  const data = await apiJson<ProjectApi>("/projects", {
    method: "POST",
    body: JSON.stringify({ Name: input.Name }),
  });
  return normalizeProject(data ?? {});
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiVoid(`/projects/${projectId}`, { method: "DELETE" });
}

export async function updateProjectResolved(projectId: string, isResolved: boolean): Promise<void> {
  await apiVoid(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify({ IsResolved: isResolved }),
  });
}

export async function addProjectMember(projectId: string, input: { Email: string; Role?: string }) {
  return await apiJson<{ added: boolean; reason?: string }>(`/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify({ Email: input.Email, Role: input.Role ?? "Member" }),
  });
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  return await apiJson<ProjectMember[]>(`/projects/${projectId}/members`);
}
