import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function DashboardHeader({ title }: { title: string }) {
    const [target, setTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setTarget(document.getElementById("dashboard-header"));
    }, []);

    if (!target) return null;

    return createPortal(<h1 className="title">{title}</h1>, target);
}
