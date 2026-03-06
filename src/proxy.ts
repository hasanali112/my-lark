import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  console.log(
    `[Proxy] Request: ${pathname}, Token: ${token ? "Found" : "Missing"}`,
  );

  // 2. Handle Route Protection
  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoot = !isAuthRoute && pathname !== "/";

  if (isProtectedRoot && !token) {
    console.log(
      `[Proxy] Redirecting to login: Protected route ${pathname} accessed without token`,
    );
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthRoute && token) {
    console.log(
      `[Proxy] Redirecting to community: Auth route ${pathname} accessed with token`,
    );
    return NextResponse.redirect(new URL("/community", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
