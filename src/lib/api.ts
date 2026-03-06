export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://myslack-server.onrender.com/api/v1";

type ApiFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : undefined;
}

function isTokenExpiringSoon(token?: string, thresholdSeconds = 60) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return false;
    const expiresAtMs = payload.exp * 1000;
    return expiresAtMs - Date.now() < thresholdSeconds * 1000;
  } catch {
    return false;
  }
}

export async function apiFetch(
  input: string,
  options: ApiFetchOptions = {},
  hasRetried = false,
): Promise<Response> {
  const { skipAuthRefresh, ...init } = options;
  const url = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;

  if (!skipAuthRefresh && !hasRetried) {
    const token = getCookie("auth_token");
    if (isTokenExpiringSoon(token)) {
      await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const response = await fetch(url, {
    ...init,
    credentials: "include",
  });

  if (response.status !== 401 || skipAuthRefresh || hasRetried) {
    return response;
  }

  const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!refreshResponse.ok) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return response;
  }

  return apiFetch(input, options, true);
}
