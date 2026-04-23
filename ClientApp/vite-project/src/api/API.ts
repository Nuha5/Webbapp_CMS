import { ApiError } from "./errors";

const API_BASE = "/dashboard-api";

function getCsrfToken(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";
}

function ensureLeadingSlash(path: string) {
  if (!path || typeof path !== "string") throw new Error("apiFetch called with invalid path: " + String(path));
  if (!path.startsWith("/")) throw new Error(`apiFetch path must start with "/". Got: ${path}`);
}

async function readBodySafe(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

/**
 * Låg-nivå fetch som alltid:
 * - lägger på CSRF header för POST/PUT/DELETE/PATCH
 * - använder same-origin cookies
 * - kastar ApiError med status + body om !ok
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  ensureLeadingSlash(path);

  const method = (options.method ?? "GET").toUpperCase();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
    const csrf = getCsrfToken();
    if (csrf) headers["RequestVerificationToken"] = csrf;
  }

  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  if (!res.ok) {
    const bodyText = await readBodySafe(res);
    throw new ApiError({ method, path, url, status: res.status, bodyText });
  }

  return res;
}

/**
 * fetch + json parse (safe)
 * - tom body => undefined
 * - invalid JSON => undefined men med console.warn (så du ser felkontrakt)
 */
export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);

  const txt = await res.text();
  if (!txt) return undefined as unknown as T;

  try {
    return JSON.parse(txt) as T;
  } catch {
    console.warn(`[apiJson] Response was not valid JSON for ${path}. Body:`, txt);
    return undefined as unknown as T;
  }
}

/** fetch där vi inte bryr oss om body */
export async function apiVoid(path: string, options: RequestInit = {}): Promise<void> {
  await apiFetch(path, options);
}
