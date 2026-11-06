import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  if (request.nextUrl.pathname.startsWith("/admin") && !request.auth) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
