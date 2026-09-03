import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      jobs: {
        include: {
          logs: {
            orderBy: { timestamp: "desc" },
            take: 50,
          },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const totalPings = await prisma.pingLog.count({
    where: { job: { userId: user.id } },
  });

  const successPings = await prisma.pingLog.count({
    where: { job: { userId: user.id }, success: true },
  });

  const latencies = await prisma.pingLog.findMany({
    where: { job: { userId: user.id }, latency: { not: null } },
    select: { latency: true },
    take: 200,
    orderBy: { timestamp: "desc" },
  });

  const avgLatency =
    latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + (b.latency || 0), 0) / latencies.length)
      : 0;

  const uptime = totalPings > 0 ? Math.round((successPings / totalPings) * 100) : 100;

  return NextResponse.json({
    stats: {
      totalJobs: user.jobs.length,
      activeJobs: user.jobs.filter((j) => j.isActive).length,
      totalPings,
      avgLatency,
      uptime,
    },
    jobs: user.jobs.map((j) => ({
      id: j.id,
      url: j.url,
      interval: j.interval,
      isActive: j.isActive,
      lastPing: j.lastPing,
      createdAt: j.createdAt,
      recentLogs: j.logs.slice(0, 10),
    })),
  });
}
