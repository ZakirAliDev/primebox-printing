import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NO_STORE =
  "private, no-cache, no-store, max-age=0, must-revalidate";

/** Prevent Hostinger hcdn / Next Full Route Cache from freezing catalog HTML. */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Cache-Control", NO_STORE);
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export const config = {
  matcher: [
    "/",
    "/about-us",
    "/quote",
    "/search",
    "/sign-in",
    "/account",
    "/package-category/:path*",
    "/packages/:path*",
    "/admin/:path*",
  ],
};
