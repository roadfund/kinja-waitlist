import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/auth/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/list", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
