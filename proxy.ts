import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const currentUser =
    request.cookies.get("currentUser")?.value || (typeof window !== "undefined" && localStorage.getItem("currentUser"))

  if (!currentUser && !request.nextUrl.pathname.startsWith("/")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (currentUser) {
    const user = JSON.parse(currentUser)

    // Admin has access to everything
    if (user.role === "Admin") {
      return NextResponse.next()
    }

    // Cashier restricted routes
    if (user.role === "Cashier") {
      const cashierRoutes = ["/cashier-dashboard", "/daily-expenses", "/worker-salary", "/salary-summary"]

      const isAllowed = cashierRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

      if (!isAllowed && request.nextUrl.pathname !== "/") {
        return NextResponse.redirect(new URL("/cashier-dashboard", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
