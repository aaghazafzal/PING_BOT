"use client";

import { useEffect, useState } from "react";
import { Globe, Activity, Zap, Clock, TrendingUp, Wifi, WifiOff } from "lucide-react";

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalPings: number;
  avgLatency: number;
  uptime: number;
}

interface PingLog {
  id: string;
  success: boolean;
  latency: number | null;
  statusCode: number | null;
  timestamp: string;
}

interface Job {
  id: string;
  url: string;
  interval: number;
  isActive: boolean;
  lastPing: string | null;
  createdAt: string;
  recentLogs: PingLog[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <div className="h-10 w-48 shimmer rounded-lg" />
          <div className="h-5 w-80 shimmer rounded-lg mt-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="h-80 shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1.5">Monitor your websites in real-time.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Monitors"
          value={stats?.totalJobs ?? 0}
          subtitle={`${stats?.activeJobs ?? 0} active`}
          icon={Globe}
          gradient="from-blue-500/10 to-cyan-500/10"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Total Pings"
          value={stats?.totalPings ?? 0}
          subtitle="Lifetime"
          icon={Zap}
          gradient="from-amber-500/10 to-orange-500/10"
          iconColor="text-amber-500"
        />
        <StatCard
          title="Avg Latency"
          value={`${stats?.avgLatency ?? 0}ms`}
          subtitle="Last 200 pings"
          icon={Clock}
          gradient="from-violet-500/10 to-purple-500/10"
          iconColor="text-violet-500"
        />
        <StatCard
          title="Uptime"
          value={`${stats?.uptime ?? 100}%`}
          subtitle="Overall"
          icon={TrendingUp}
          gradient="from-emerald-500/10 to-green-500/10"
          iconColor="text-emerald-500"
        />
      </div>

      {/* Monitor List */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Your Monitors</h2>
        {jobs.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No monitors yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Use the Telegram bot to add your first URL monitor. Send{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">/add</code>{" "}
              with a URL and interval.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <MonitorCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-primary/20 transition-colors duration-300">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight mt-2">{value}</h3>
          <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    </div>
  );
}

function MonitorCard({ job }: { job: Job }) {
  const successRate =
    job.recentLogs.length > 0
      ? Math.round((job.recentLogs.filter((l) => l.success).length / job.recentLogs.length) * 100)
      : 100;

  const lastLatency = job.recentLogs[0]?.latency;
  const hostname = (() => {
    try { return new URL(job.url).hostname; } catch { return job.url; }
  })();

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-primary/20 transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${job.isActive ? "bg-emerald-500 animate-pulse-dot" : "bg-red-500"}`} />
            <h3 className="font-semibold text-sm truncate">{hostname}</h3>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              job.isActive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            }`}>
              {job.isActive ? "Active" : "Paused"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{job.url}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/60">
            <span>Every {job.interval}m</span>
            {lastLatency && <span>{lastLatency}ms</span>}
            <span>Uptime: {successRate}%</span>
          </div>
        </div>

        {/* Mini status bars */}
        <div className="flex items-center gap-[3px]">
          {Array.from({ length: 10 }).map((_, i) => {
            const log = job.recentLogs[9 - i];
            return (
              <div
                key={i}
                className={`w-1.5 h-7 rounded-full transition-all duration-200 ${
                  log
                    ? log.success
                      ? "bg-emerald-500/80 group-hover:bg-emerald-500"
                      : "bg-red-500/80 group-hover:bg-red-500"
                    : "bg-muted"
                }`}
                title={log ? `${log.statusCode || "Timeout"} — ${log.latency}ms` : "No data"}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
