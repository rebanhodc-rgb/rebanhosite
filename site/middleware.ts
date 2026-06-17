import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const STAFF_GATED_PATHS = ["/loja", "/produto", "/carrinho", "/checkout", "/experiencia"];

function isStaffGatedPath(pathname: string) {
  return STAFF_GATED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function hasStaffAccess(req: NextRequest) {
  const access = req.cookies.get("rebanho_staff_access")?.value;
  return access === "granted" || access === "true";
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isStaffGatedPath(pathname) && !hasStaffAccess(req)) {
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET });
  const shouldEnforce = process.env.ENFORCE_ADMIN_AUTH === "true";

  if (shouldEnforce && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/minha-conta", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/loja/:path*", "/loja", "/produto/:path*", "/carrinho/:path*", "/carrinho", "/checkout/:path*", "/checkout", "/experiencia/:path*", "/experiencia"]
};
