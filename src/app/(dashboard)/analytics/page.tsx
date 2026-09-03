"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Log {
  id: string;
  url: string;
  statusCode: number | null;
  latency: number | null;
  success: boolean;
  timestamp: string;
}

interface ChartPoint {
  time: string;
  success: number;
  fail: number;
  avgLatency: number;
}

interface JobStat {
  url: string;
  total: number;
  success: number;
  uptime: number;
  avgLatency: number;
}

export default function AnalyticsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [jobStats, setJobStats] = useState<JobStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setChartData(data.chartData || []);
        setJobStats(data.jobStats || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="h-10 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-56 shimmer rounded-2xl" />
          <div className="h-56 shimmer rounded-2xl" />
        </div>
        <div className="h-64 shimmer rounded-2xl" />
      </div>
    );
  }

  const maxLatency = chartData.length > 0 ? Math.max(...chartData.map((d) => d.avgLatency), 1) : 1;
  const maxPings = chartData.length > 0 ? Math.max(...chartData.map((d) => d.success + d.fail), 1) : 1;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Deep performance insights across all monitors.</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latency Chart */}
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <h3 className="font-semibold text-sm">Latency Over Time</h3>
          </div>
          {chartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No data yet. Pings will appear here.
            </div>
          ) : (
            <>
              <div className="h-40 flex items-end gap-px w-full overflow-hidden">
                {chartData.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-0 group relative"
                    title={`${new Date(d.time).toLocaleTimeString()} — ${d.avgLatency}ms`}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-violet-500/80 to-violet-400/40 rounded-t-sm transition-all duration-300 group-hover:from-violet-500 min-h-[2px]"
                      style={{ height: `${(d.avgLatency / maxLatency) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-2">
                <span>{chartData[0] ? new Date(chartData[0].time).toLocaleDateString() : ""}</span>
                <span>Now</span>
              </div>
            </>
          )}
        </div>

        {/* Success/Fail Chart */}
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <h3 className="font-semibold text-sm">Pings Per Hour</h3>
          </div>
          {chartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No data yet. Pings will appear here.
            </div>
          ) : (
            <>
              <div className="h-40 flex items-end gap-px w-full overflow-hidden">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 min-w-0 flex flex-col justify-end gap-px">
                    {d.fail > 0 && (
                      <div
                        className="w-full bg-red-500/60 rounded-t-sm"
                        style={{ height: `${(d.fail / maxPings) * 100}%` }}
                      />
                    )}
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500/80 to-emerald-400/40 rounded-t-sm transition-all min-h-[2px]"
                      style={{ height: `${(d.success / maxPings) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" />Success</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 flex-shrink-0" />Failed</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Per-Job Stats */}
      {jobStats.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-3">Per-Monitor Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobStats.map((js, i) => {
              const hostname = (() => { try { return new URL(js.url).hostname; } catch { return js.url; } })();
              return (
                <div key={i} className="glass-card rounded-2xl p-4">
                  <h4 className="font-semibold text-sm truncate mb-3 text-foreground">{hostname}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2.5 rounded-xl bg-muted/50">
                      <p className="text-base sm:text-lg font-bold">{js.uptime}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-muted/50">
                      <p className="text-base sm:text-lg font-bold">{js.avgLatency}<span className="text-xs font-normal">ms</span></p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Latency</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-emerald-500/5">
                      <p className="text-base sm:text-lg font-bold text-emerald-500">{js.success}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Success</p>
                    </div>
                    <div className="text-center p-2.5 rounded-xl bg-red-500/5">
                      <p className="text-base sm:text-lg font-bold text-red-500">{js.total - js.success}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Failed</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Logs - Mobile card layout instead of table */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-3">Recent Logs</h2>

        {/* Desktop Table */}
        <div className="glass-card rounded-2xl overflow-hidden hidden sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latency</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-sm">
                      No ping logs yet. They will appear as your bot monitors URLs.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const hostname = (() => { try { return new URL(log.url).hostname; } catch { return log.url; } })();
                    return (
                      <tr key={log.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-sm">{hostname}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            log.success ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          }`}>
                            {log.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {log.statusCode || "Timeout"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{log.latency ? `${log.latency}ms` : "—"}</td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="sm:hidden space-y-2">
          {logs.length === 0 ? (
            <div className="glass-card rounded-2xl px-5 py-10 text-center text-muted-foreground text-sm">
              No ping logs yet. They will appear as your bot monitors URLs.
            </div>
          ) : (
            logs.map((log) => {
              const hostname = (() => { try { return new URL(log.url).hostname; } catch { return log.url; } })();
              return (
                <div key={log.id} className="glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{hostname}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{log.latency ? `${log.latency}ms` : "—"}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      log.success ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {log.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {log.statusCode || "Timeout"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
