import { NextResponse } from "next/server";
import { passwordMatches, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/auth/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  const attempt = typeof password === "string" ? password : "";
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET;
  const back = new URL("/list", request.url);
  if (!secret || !expected) {
    back.searchParams.set("error", "config");
    return NextResponse.redirect(back, 303);
  }
  if (!passwordMatches(attempt, expected)) {
    back.searchParams.set("error", "password");
    return NextResponse.redirect(back, 303);
  }
  const response = NextResponse.redirect(new URL("/list", request.url), 303);
  response.cookies.set(SESSION_COOKIE, signSession(secret), sessionCookieOptions());
  return response;
}
