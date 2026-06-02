import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "secret");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth-token")?.value;

  let payload: any = null;
  if (token) {
    try {
      const { payload: p } = await jwtVerify(token, secret);
      payload = p;
    } catch {}
  }

  if (pathname.startsWith("/admin")) {
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
