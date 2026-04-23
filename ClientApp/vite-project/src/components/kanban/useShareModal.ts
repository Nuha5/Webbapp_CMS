import { useState } from "react";
import { addProjectMember } from "../../api/projects";
import { toUiError } from "../../api/errors";
import type { ShareModalTexts } from "../../cms/projectDashboardCms";

export type ProjectRole = "Member" | "Owner";

export function useShareModal(projectId: string, texts: ShareModalTexts) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<ProjectRole>("Member");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState<string | null>(null);

    async function submit() {
        const trimmed = email.trim();
        if (!trimmed) return;

        setBusy(true);
        setError(null);
        setDone(null);

        try {
            const res = await addProjectMember(projectId, { Email: trimmed, Role: role });

            if (res?.added) {
                setDone(texts.successText);
                setEmail("");
                return;
            }

            const reason = (res?.reason ?? "").trim();
            if (reason.toLowerCase().includes("not found")) {
                setError(reason);
            } else {
                setDone(reason || texts.alreadyHasAccessText);
            }

            setEmail("");
        } catch (e) {
            setError(toUiError(e, "Share failed"));
        } finally {
            setBusy(false);
        }
    }

    return {
        email,
        setEmail,
        role,
        setRole,
        error,
        busy,
        done,
        submit,
    };
}
