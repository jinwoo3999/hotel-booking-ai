import { auth } from "@/auth"; 

import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/register");
  const isAdminPage = path.startsWith("/admin");

  // 1. Vào Admin mà chưa login -> Đá về Login
  if (isAdminPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Vào Admin mà Role không phải ADMIN/SUPER_ADMIN -> Đá về trang chủ
  if (isAdminPage && role !== "ADMIN" && role !== "PARTNER" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 3. Đã Login mà cố vào trang Login -> Đá về trang chủ
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};