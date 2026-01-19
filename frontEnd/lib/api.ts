const API_BASE =
  process.env.NEXT_PUBLIC_SPRING_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8080";

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = new Headers(options.headers || {});

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return res;
};

export const apiJson = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await apiFetch(path, options);

  if (!res.ok) {
    const message = await res.text();
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
    const message = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${message}`);
  }
};
