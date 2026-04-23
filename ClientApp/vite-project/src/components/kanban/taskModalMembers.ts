import type { ProjectMember } from "../../api/projects";

export function displayMember(member: ProjectMember): string {
    const email = member.Email ?? "";
    const displayName =
        "DisplayName" in member && typeof member.DisplayName === "string" ? member.DisplayName : "";

    if (displayName && email) return `${displayName} (${email})`;
    if (email) return email;
    return member.UserId ?? "Unknown";
}

export function createMemberMap(members: ProjectMember[]): Map<string, ProjectMember> {
    const map = new Map<string, ProjectMember>();
    for (const member of members) {
        if (member.UserId) map.set(member.UserId, member);
    }
    return map;
}

export function filterAssignableMembers(
    members: ProjectMember[],
    assignees: string[],
    query: string
): ProjectMember[] {
    const q = query.trim().toLowerCase();

    const available = members
        .filter((m) => !!m.UserId)
        .filter((m) => m.UserId != null && !assignees.includes(m.UserId));

    if (!q) return available.slice(0, 8);

    return available
        .filter((m) => {
            const email = (m.Email ?? "").toLowerCase();
            const displayName =
                "DisplayName" in m && typeof m.DisplayName === "string"
                    ? m.DisplayName.toLowerCase()
                    : "";

            return email.includes(q) || displayName.includes(q);
        })
        .slice(0, 8);
}
