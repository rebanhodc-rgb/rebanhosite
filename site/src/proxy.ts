import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/home",
  "/loja",
  "/provador",
  "/checkout",
  "/produto",
  "/pedido",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) return NextResponse.next();

  const hasAccess = request.cookies.get("rebanho_staff_access")?.value === "granted";
  if (hasAccess) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|products|hero.svg|editorial.svg).*)"],
};
