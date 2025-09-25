import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect /dashboard routes (allow both admin and user)
  if (pathname.startsWith("/dashboard")) {
    if (!token || !["admin"].includes(token.role)) {
      const url = new URL("/", request.url);

      return NextResponse.redirect(url);
    }
  }
  // Protect /account routes (allow both admin and user)
  if (pathname.startsWith("/account")) {
    if (!token || !["user"].includes(token.role)) {
      const url = new URL("/", request.url);

      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
