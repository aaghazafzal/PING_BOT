import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    try {
      await prisma.session.delete({ where: { token } });
    } catch {}
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("session_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
