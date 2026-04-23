import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { readMeta } from "../ui/meta";
import { getDashboardActionTexts } from "../cms/projectDashboardCms";
import { SignOutButton } from "./SignOutButton";

export function DashboardActions({ onShare }: { onShare: () => void }) {
    const projectsUrl = readMeta("projects-url", "/") || "/";
    const texts = getDashboardActionTexts();

    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setHost(document.getElementById("dashboard-actions"));
    }, []);

    if (!host) return null;

    return createPortal(
        <div className="dashActions">
            <div className="dashActionsRow">
                <button
                    className="secondary"
                    type="button"
                    onClick={() => (window.location.href = projectsUrl)}
                >
                    {texts.allProjectsButtonText}
                </button>

                <button className="btn" type="button" onClick={onShare}>
                    {texts.shareButtonText}
                </button>
            </div>

            <div className="dashActionsRow">
                <SignOutButton formClassName="dashSignoutForm" />
            </div>
        </div>,
        host
    );
}
