import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Ambil secret dari AUTH_SECRET atau fallback NEXTAUTH_SECRET
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret }); // <— tambahkan secret di sini
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/app")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    if (
      pathname.startsWith("/app/admin") &&
      (token as { role?: string }).role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    // Protect selected APIs as a second layer
    "/api/exports/:path*",
    "/api/uploads/:path*",
    "/api/low-stock/count",
  ],
};
