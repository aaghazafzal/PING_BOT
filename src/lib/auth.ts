import { cookies } from "next/headers";
import prisma from "./prisma";

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) return null;
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function generateToken(length = 64): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function generateApiKey(): string {
  return `pb_${generateToken(40)}`;
}
