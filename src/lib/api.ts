export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://myslack-server.onrender.com/api/v1";

type ApiFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
  skipRedirect?: boolean;
};

function getToken(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  // Also check cookie as a fallback during migration
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return (
    localStorage.getItem(name) ||
    (cookieValue ? decodeURIComponent(cookieValue) : undefined)
  );
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
  const { skipAuthRefresh, skipRedirect, ...init } = options;
  const url = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;

  if (!skipAuthRefresh && !hasRetried) {
    const token = getToken("auth_token");
    if (isTokenExpiringSoon(token)) {
      const refreshToken = getToken("refresh_token");
      const refreshOptions: RequestInit = {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      };
      if (refreshToken)
        refreshOptions.body = JSON.stringify({ refresh_token: refreshToken });

      const refreshRes = await fetch(
        `${API_BASE_URL}/auth/refresh`,
        refreshOptions,
      );
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (typeof window !== "undefined") {
          const accessToken = data.data?.access_token || data.access_token;
          const refreshToken = data.data?.refresh_token || data.refresh_token;
          if (accessToken) {
            localStorage.setItem("auth_token", accessToken);
            // Set first-party cookie for middleware/proxy to use
            document.cookie = `auth_token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
            console.log("Access token refreshed and stored");
          }
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
        }
      }
    }
  }

  const currentToken = getToken("auth_token");
  const headers = new Headers(init.headers);
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status !== 401 || skipAuthRefresh || hasRetried) {
    return response;
  }

  const refreshToken = getToken("refresh_token");
  const refreshOptions: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  if (refreshToken)
    refreshOptions.body = JSON.stringify({ refresh_token: refreshToken });

  const refreshResponse = await fetch(
    `${API_BASE_URL}/auth/refresh`,
    refreshOptions,
  );

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
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    if (typeof window !== "undefined" && !skipRedirect) {
      window.location.href = "/auth/login";
    }
    return response;
  } else {
    const data = await refreshResponse.json();
    if (typeof window !== "undefined") {
      const accessToken = data.data?.access_token || data.access_token;
      const refreshToken = data.data?.refresh_token || data.refresh_token;
      if (accessToken) {
        localStorage.setItem("auth_token", accessToken);
        // Set first-party cookie for middleware/proxy to use
        document.cookie = `auth_token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
        console.log("Access token refreshed after 401 and stored");
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
    }
  }

  return apiFetch(input, options, true);
}
