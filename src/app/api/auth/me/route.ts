import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      name: session.user.name,
      username: session.user.username,
      telegramId: session.user.telegramId,
      photoUrl: session.user.photoUrl,
      createdAt: session.user.createdAt,
    },
  });
}
