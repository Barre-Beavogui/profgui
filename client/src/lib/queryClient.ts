import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function withApiBase(path: string): string {
  if (!API_BASE_URL || path.startsWith("http")) {
    return path;
  }
  return new URL(path, API_BASE_URL).toString();
}

/** Extrait le message lisible d'une erreur d'API ("401: {\"message\":\"...\"}"). */
export function readableError(error: unknown, fallback = "Une erreur est survenue."): string {
  if (!(error instanceof Error) || !error.message) return fallback;
  const match = error.message.match(/^\d{3}: ([\s\S]*)$/);
  const body = match ? match[1] : error.message;
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed.message === "string") return parsed.message;
  } catch {
    // corps non JSON
  }
  return body.length < 200 ? body : fallback;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(withApiBase(url), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Construit l'URL à partir de la clé de requête :
 * les chaînes forment le chemin, un objet final devient la query string.
 * ex. ["/api/teachers", { city: "Conakry" }] -> "/api/teachers?city=Conakry"
 */
export function buildUrlFromQueryKey(queryKey: readonly unknown[]): string {
  const parts: string[] = [];
  const params = new URLSearchParams();
  for (const part of queryKey) {
    if (part && typeof part === "object") {
      for (const [key, value] of Object.entries(part as Record<string, unknown>)) {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      }
    } else if (part !== undefined && part !== null) {
      parts.push(String(part));
    }
  }
  const qs = params.toString();
  return parts.join("/") + (qs ? `?${qs}` : "");
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(withApiBase(buildUrlFromQueryKey(queryKey)), {
      credentials: "include",
      mode: "cors",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
