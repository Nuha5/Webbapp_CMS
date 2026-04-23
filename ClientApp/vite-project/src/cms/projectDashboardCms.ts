import { readMeta } from "../ui/meta";

export type ShareModalTexts = {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    roleLabel: string;
    ownerLabel: string;
    memberLabel: string;
    closeButtonText: string;
    submitButtonText: string;
    successText: string;
    alreadyHasAccessText: string;
};

export type TaskModalTexts = {
    createTitle: string;
    editTitle: string;
    titleLabel: string;
    descriptionLabel: string;
    assigneesLabel: string;
    noAssigneesText: string;
    assigneeSearchPlaceholder: string;
    removeAssigneeTitle: string;
    cancelButtonText: string;
    saveButtonText: string;
    deleteButtonText: string;
    titleRequiredError: string;
    membersLoadError: string;
};

export type DashboardActionTexts = {
    allProjectsButtonText: string;
    shareButtonText: string;
    signOutButtonText: string;
};

export type BoardTexts = {
    addButtonText: string;
    colTitleToDo: string;
    colTitleInProgress: string;
    colTitleDone: string;
};

export function getShareModalTexts(): ShareModalTexts {
    return {
        title: readMeta("share-dialog-title", "Share project"),
        emailLabel: readMeta("share-dialog-email-label", "User email"),
        emailPlaceholder: readMeta("share-dialog-email-placeholder", "name@company.com"),
        roleLabel: readMeta("share-dialog-role-label", "Role"),
        ownerLabel: readMeta("owner-label", "Owner"),
        memberLabel: readMeta("member-label", "Member"),
        closeButtonText: readMeta("share-dialog-close-button-text", "Close"),
        submitButtonText: readMeta("share-dialog-submit-button-text", "Share"),
        successText: readMeta("share-success-text", "User added to project successfully."),
        alreadyHasAccessText: readMeta("user-already-has-access-text", "User already has access."),
    };
}

export function getTaskModalTexts(): TaskModalTexts {
    return {
        createTitle: readMeta("create-task-title", "Create task"),
        editTitle: readMeta("edit-task-title", "Edit task"),
        titleLabel: readMeta("task-title-label", "Title"),
        descriptionLabel: readMeta("task-description-label", "Description"),
        assigneesLabel: readMeta("assignees-label", "Assignees"),
        noAssigneesText: readMeta("no-assignees-text", "No assignees yet"),
        assigneeSearchPlaceholder: readMeta("assignee-search-placeholder", "Type email"),
        removeAssigneeTitle: readMeta("remove-assignee-title", "Remove"),
        cancelButtonText: readMeta("task-cancel-button-text", "Cancel"),
        saveButtonText: readMeta("task-save-button-text", "Save"),
        deleteButtonText: readMeta("task-delete-button-text", "Delete"),
        titleRequiredError: readMeta("task-title-required-error", "Title is required."),
        membersLoadError: readMeta("task-members-load-error", "Failed to load members"),
    };
}

export function getDashboardActionTexts(): DashboardActionTexts {
    return {
        allProjectsButtonText: readMeta("all-projects-button-text", "All Projects"),
        shareButtonText: readMeta("share-button-text", "Share"),
        signOutButtonText: readMeta("signout-button-text", "Sign out"),
    };
}

export function getBoardTexts(): BoardTexts {
    return {
        addButtonText: readMeta("board-add-button-text", "Add"),
        colTitleToDo: readMeta("col-title-todo", "To do"),
        colTitleInProgress: readMeta("col-title-inprogress", "In progress"),
        colTitleDone: readMeta("col-title-done", "Done"),
    };
}
