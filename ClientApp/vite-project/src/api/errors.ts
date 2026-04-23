export class ApiError extends Error {
    method: string;
    path: string;
    url: string;
    status: number;
    bodyText: string;

    constructor(args: { method: string; path: string; url: string; status: number; bodyText: string }) {
        super(`${args.method} ${args.path} failed (${args.status})`);
        this.name = "ApiError";
        this.method = args.method;
        this.path = args.path;
        this.url = args.url;
        this.status = args.status;
        this.bodyText = args.bodyText;
    }
}

function tryParseJson(text: string): any | null {
    if (!text) return null;
    const t = text.trim();
    if (!t) return null;
    // snabb guard: om det inte ens ser ut som JSON
    if (!(t.startsWith("{") || t.startsWith("["))) return null;
    try {
        return JSON.parse(t);
    } catch {
        return null;
    }
}

function pickMessageFromParsed(parsed: any): string | null {
    if (!parsed) return null;

    // vanliga varianter
    const msg =
        parsed.error ??
        parsed.message ??
        parsed.reason ??
        parsed.title ??
        parsed.detail ??
        null;

    if (typeof msg === "string" && msg.trim()) return msg.trim();

    // ibland: { errors: { Email: ["..."] } }
    if (parsed.errors && typeof parsed.errors === "object") {
        const firstKey = Object.keys(parsed.errors)[0];
        const v = parsed.errors[firstKey];
        if (Array.isArray(v) && typeof v[0] === "string") return v[0];
        if (typeof v === "string") return v;
    }

    return null;
}

function defaultStatusMessage(status: number): string | null {
    if (status === 400) return "Bad request.";
    if (status === 401) return "You are not logged in.";
    if (status === 403) return "You don't have access.";
    if (status === 404) return "Not found.";
    if (status >= 500) return "Server error.";
    return null;
}

export function toUiError(err: unknown, fallback: string): string {
    if (!err) return fallback;

    if (err instanceof ApiError) {
        // 1) JSON body?
        const parsed = tryParseJson(err.bodyText);
        const jsonMsg = pickMessageFromParsed(parsed);
        if (jsonMsg) return jsonMsg;

        // 2) plain text body?
        const t = (err.bodyText ?? "").trim();
        if (t) return t;

        // 3) status fallback
        return defaultStatusMessage(err.status) ?? fallback;
    }

    if (err instanceof Error) {
        const m = (err.message ?? "").trim();
        return m || fallback;
    }

    return String(err);
}
