import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const AUTH_TOKEN_KEY = "profgui-auth-token";

function withApiBase(path: string): string {
  if (!API_BASE_URL || path.startsWith("http")) {
    return path;
  }
  return new URL(path, API_BASE_URL).toString();
}

export function setAuthToken(token: string | null | undefined) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function getAuthHeaders(data?: unknown): HeadersInit {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      clearAuthToken();
    }
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
    headers: getAuthHeaders(data),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(withApiBase(queryKey.join("/") as string), {
      headers: getAuthHeaders(),
      credentials: "include",
      mode: "cors",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      clearAuthToken();
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
