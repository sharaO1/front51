export const API_BASE =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5002/api";

export function joinApi(path: string) {
  if (!path) return API_BASE;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

// Extract a human-friendly error message from a fetch Response
export async function getErrorMessageFromResponse(
  res: Response,
): Promise<string> {
  try {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = (await res.json().catch(() => null)) as {
        message?: string;
        error?: string;
        details?: string;
        [k: string]: any;
      } | null;
      if (body && typeof body === "object") {
        const msg = body.message || body.error || body.details;
        if (msg) return String(msg);
      }
    }

    const text = await res.text().catch(() => "");
    return text || res.statusText || `HTTP ${res.status}`;
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

// Extract an error message from unknown error values
export function extractErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
) {
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    (err as any).message
  ) {
    return String((err as any).message);
  }
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

// Wrapper to fetch and parse JSON, throwing with backend message when not ok
export async function apiFetch<T = any>(
  pathOrUrl: string,
  init: RequestInit = {},
): Promise<T> {
  const url = /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : joinApi(pathOrUrl);
  const res = await fetch(url, init);
  if (!res.ok) {
    const msg = await getErrorMessageFromResponse(res);
    throw new Error(msg);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}
