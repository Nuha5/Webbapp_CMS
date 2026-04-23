export function readMeta(name: string, fallback = ""): string {
    const value = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? "";
    const trimmed = value.trim();
    return trimmed || fallback;
}

