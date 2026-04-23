import type { Task, TaskStatus } from "../../api/tasks";
import type { TaskModalTexts } from "../../cms/projectDashboardCms";

export type TaskModalProps = {
    projectId: string;
    mode: "create" | "edit";
    initialTask?: Task;
    defaultStatus?: TaskStatus;
    onClose: () => void;
    onCreate: (input: { Title: string; Description?: string | null; Status: TaskStatus }) => void;
    onUpdate: (
        id: string,
        input: {
            Title: string;
            Description?: string | null;
            Status: TaskStatus;
            AssigneeUserIds: string[];
        }
    ) => void;
    onDelete: (id: string) => void;
    texts: TaskModalTexts;
};
