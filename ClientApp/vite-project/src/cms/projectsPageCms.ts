import { readMeta } from "../ui/meta";

export type ProjectsPageCms = {
    createProjectPlaceholder: string;
    createProjectButtonText: string;
    noProjectsText: string;
    resolvedLabel: string;
    deleteProjectConfirmationText: string;
    deleteButtonText: string;
    cancelButtonText: string;
    confirmDeleteButtonText: string;
    signOutButtonText: string;
};

export function getProjectsPageCms(): ProjectsPageCms {
    return {
        createProjectPlaceholder: readMeta("create-project-placeholder", "New project name…"),
        createProjectButtonText: readMeta("create-project-button-text", "Create"),
        noProjectsText: readMeta("no-projects-text", "No projects yet"),
        resolvedLabel: readMeta("resolved-label", "Resolved"),
        deleteProjectConfirmationText: readMeta(
            "delete-project-confirmation-text",
            "Are you sure you want to delete this project?"
        ),
        deleteButtonText: readMeta("delete-button-text", "Delete"),
        cancelButtonText: readMeta("cancel-button-text", "Cancel"),
        confirmDeleteButtonText: readMeta("confirm-delete-button-text", "Yes"),
        signOutButtonText: readMeta("signout-button-text", "Sign out"),
    };
}
