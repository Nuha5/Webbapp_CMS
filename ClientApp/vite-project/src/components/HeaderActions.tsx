import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../theme/useTheme";
import { SignOutButton } from "./SignOutButton";

export function HeaderActions() {
    const { theme, toggleTheme } = useTheme();

    const [target, setTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setTarget(document.getElementById("header-actions"));
    }, []);

    if (!target) return null;

    return createPortal(
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <SignOutButton />
        </div>,
        target
    );
}
