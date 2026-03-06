import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 2. Handle Route Protection
  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute = !isAuthRoute && pathname !== "/";

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthRoute && token) {
    // Exception for verification page if you want users to be able to verify while logged in
    // but usually, they should be logged out. Assuming standard redirect for all auth routes.
    return NextResponse.redirect(new URL("/chat", request.url));
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
