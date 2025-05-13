import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/profile"]

// Define admin-only routes
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is an admin-only route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Get the auth cookie
  const authCookie = request.cookies.get("auth")?.value

  // If the route is protected and there's no auth cookie, redirect to login
  if (isProtectedRoute && !authCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If the user is already logged in and tries to access login/register pages, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && authCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // For admin routes, we would need to check if the user is an admin
  // This would require a more complex solution with JWT tokens or session storage
  // For now, we'll just check if they're authenticated

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*", "/login", "/register"],
}
