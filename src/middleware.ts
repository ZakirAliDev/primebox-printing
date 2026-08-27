import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NO_STORE =
  "private, no-cache, no-store, max-age=0, must-revalidate";

/** Admin stays uncached; storefront uses ISR + revalidateTag on catalog writes. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", NO_STORE);
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
