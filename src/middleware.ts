import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Prevent Hostinger/proxy HTML caches from freezing catalog-driven pages. */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}

export const config = {
  matcher: [
    "/",
    "/package-category/:path*",
    "/packages/:path*",
    "/search",
    "/about",
    "/admin/:path*",
  ],
};
