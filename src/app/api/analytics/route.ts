import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.pingLog.findMany({
    where: { job: { userId: session.user.id } },
    orderBy: { timestamp: "desc" },
    take: 200,
    include: { job: { select: { url: true } } },
  });

  // Group by hour for chart data
  const hourlyData: Record<string, { success: number; fail: number; totalLatency: number; count: number }> = {};
  
  logs.forEach((log) => {
    const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ":00";
    if (!hourlyData[hour]) {
      hourlyData[hour] = { success: 0, fail: 0, totalLatency: 0, count: 0 };
    }
    if (log.success) hourlyData[hour].success++;
    else hourlyData[hour].fail++;
    hourlyData[hour].totalLatency += log.latency || 0;
    hourlyData[hour].count++;
  });

  const chartData = Object.entries(hourlyData)
    .map(([time, data]) => ({
      time,
      success: data.success,
      fail: data.fail,
      avgLatency: data.count > 0 ? Math.round(data.totalLatency / data.count) : 0,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-24);

  // Per-job stats
  const jobIds = Array.from(new Set(logs.map((l) => l.jobId)));
  const jobStats = await Promise.all(
    jobIds.map(async (jobId) => {
      const job = await prisma.pingJob.findUnique({ where: { id: jobId } });
      const jobLogs = logs.filter((l) => l.jobId === jobId);
      const successCount = jobLogs.filter((l) => l.success).length;
      return {
        url: job?.url || "Unknown",
        total: jobLogs.length,
        success: successCount,
        uptime: jobLogs.length > 0 ? Math.round((successCount / jobLogs.length) * 100) : 100,
        avgLatency:
          jobLogs.length > 0
            ? Math.round(jobLogs.reduce((a, b) => a + (b.latency || 0), 0) / jobLogs.length)
            : 0,
      };
    })
  );

  return NextResponse.json({
    logs: logs.slice(0, 50).map((l) => ({
      id: l.id,
      url: l.job.url,
      statusCode: l.statusCode,
      latency: l.latency,
      success: l.success,
      timestamp: l.timestamp,
    })),
    chartData,
    jobStats,
  });
}
