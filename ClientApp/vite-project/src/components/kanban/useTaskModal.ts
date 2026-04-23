import { useEffect, useMemo, useRef, useState } from "react";
import { getProjectMembers, type ProjectMember } from "../../api/projects";
import type { TaskStatus } from "../../api/tasks";
import type { TaskModalProps } from "./taskModalTypes";
import { createMemberMap, filterAssignableMembers } from "./taskModalMembers";

export function useTaskModal(props: TaskModalProps) {
    const [Title, setTitle] = useState("");
    const [Description, setDescription] = useState<string>("");
    const [Status, setStatus] = useState<TaskStatus>(props.defaultStatus ?? "ToDo");

    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [assignees, setAssignees] = useState<string[]>([]);
    const [membersError, setMembersError] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setLocalError(null);

        if (props.mode === "edit" && props.initialTask) {
            setTitle(props.initialTask.Title);
            setDescription(props.initialTask.Description ?? "");
            setStatus(props.initialTask.Status);
            setAssignees(props.initialTask.AssigneeUserIds ?? []);
        } else {
            setTitle("");
            setDescription("");
            setStatus(props.defaultStatus ?? "ToDo");
            setAssignees([]);
        }

        setQuery("");
        setOpen(false);
    }, [props.mode, props.initialTask, props.defaultStatus]);

    useEffect(() => {
        let alive = true;
        setMembersError(null);

        (async () => {
            try {
                const list = await getProjectMembers(props.projectId);
                if (alive) setMembers(list.filter((m) => !!m.UserId));
            } catch {
                if (alive) setMembersError(props.texts.membersLoadError);
            }
        })();

        return () => {
            alive = false;
        };
    }, [props.projectId, props.texts.membersLoadError]);

    const memberById = useMemo(() => createMemberMap(members), [members]);

    const filtered = useMemo(
        () => filterAssignableMembers(members, assignees, query),
        [members, assignees, query]
    );

    function addAssignee(userId: string) {
        if (!userId) return;
        setAssignees((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
        setQuery("");
        setOpen(false);
        inputRef.current?.focus();
    }

    function removeAssignee(userId: string) {
        setAssignees((prev) => prev.filter((x) => x !== userId));
    }

    function save() {
        const trimmedTitle = Title.trim();
        const trimmedDescription = Description.trim();

        if (!trimmedTitle) {
            setLocalError(props.texts.titleRequiredError);
            return;
        }

        setLocalError(null);

        if (props.mode === "create") {
            props.onCreate({
                Title: trimmedTitle,
                Description: trimmedDescription || null,
                Status,
            });
        } else if (props.initialTask) {
            props.onUpdate(props.initialTask.Id, {
                Title: trimmedTitle,
                Description: trimmedDescription || null,
                Status: props.initialTask.Status,
                AssigneeUserIds: assignees,
            });
        }

        props.onClose();
    }

    function remove() {
        if (!props.initialTask) return;
        props.onDelete(props.initialTask.Id);
        props.onClose();
    }

    return {
        Title,
        setTitle,
        Description,
        setDescription,
        Status,
        setStatus,
        membersError,
        localError,
        setLocalError,
        assignees,
        memberById,
        query,
        setQuery,
        open,
        setOpen,
        inputRef,
        filtered,
        addAssignee,
        removeAssignee,
        save,
        remove,
    };
}
