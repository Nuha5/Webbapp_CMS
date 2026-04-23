import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function DashboardTitle({ title }: { title: string }) {
    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setHost(document.getElementById("dashboard-title"));
    }, []);

    if (!host) return null;

    return createPortal(<h1 className="title">{title}</h1>, host);
}
