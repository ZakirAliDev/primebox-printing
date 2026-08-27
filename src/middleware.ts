import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NO_STORE =
  "private, no-cache, no-store, max-age=0, must-revalidate";

/**
 * - Admin: never cache
 * - Storefront HTML: no CDN/HTML cache so hard refresh matches soft navigation
 *   (ISR Full Route Cache was serving stale category image URLs on reload)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (pathname.startsWith("/uploads/")) {
    // Let the uploads route set its own cache headers.
    return response;
  }

  if (pathname.startsWith("/admin") || pathname === "/" || pathname.startsWith("/package-category") || pathname.startsWith("/packages")) {
    response.headers.set("Cache-Control", NO_STORE);
    response.headers.set("CDN-Cache-Control", "no-store");
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/package-category/:path*",
    "/packages/:path*",
    "/uploads/:path*",
  ],
};
