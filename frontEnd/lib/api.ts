
// lib/api.ts

// Determine API_BASE dynamically
const getApiBase = (): string => {
  // 1) Explicit override from env
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");
  }

  // 2) Client-side: infer from Codespaces host
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;

    if (hostname.endsWith(".app.github.dev")) {
      // Replace ONLY the final "-<port>.app.github.dev" with the desired port,
      // swapping 3000 -> 8080; other ports remain unchanged.
      const newHost = hostname.replace(/-(\d+)\.app\.github\.dev$/, (_m, port) => {
        const backendPort = port === "3000" ? "8080" : port; // only swap from 3000 to 8080
        return `-${backendPort}.app.github.dev`;
      });

      return `${protocol}//${newHost}`;
    }
  }

  // 3) Fallback: local dev
  return "http://localhost:8080";
};

const API_BASE = getApiBase();

/**
 * Ensure path starts with a single leading slash.
 * Examples:
 *  normalizePath("users")      -> "/users"
 *  normalizePath("/users")     -> "/users"
 *  normalizePath("//users")    -> "/users"
 */
const normalizePath = (path: string) => `/${path}`.replace(/\/{2,}/g, "/");

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = new Headers(options.headers || {});
  const normalizedPath = normalizePath(path);

  // Attach bearer token if present (client-side only)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // If sending JSON (and body isn't FormData), set Content-Type
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_BASE}${normalizedPath}`;

  // Optional debug hook (remove in prod)
  if (typeof window !== "undefined" && !(window as any).__API_BASE_DEBUG__) {
    (window as any).__API_BASE_DEBUG__ = API_BASE;
    // console.log("API_BASE:", API_BASE);
  }
  // console.log("apiFetch →", url, options);

  const finalOptions: RequestInit = {
    ...options,
    headers,
  };

  const res = await fetch(url, finalOptions);
  return res;
};

export const apiJson = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await apiFetch(path, options);

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${message}`);
  }

  return (await res.json()) as T;
};

export const apiJsonNoBody = async (
  path: string,
  options: RequestInit = {}
): Promise<void> => {
  const res = await apiFetch(path, options);

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${message}`);
  }
};
