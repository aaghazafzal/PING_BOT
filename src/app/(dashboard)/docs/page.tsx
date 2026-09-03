"use client";

import { useState } from "react";
import { BookOpen, Copy, Check, ChevronDown, ChevronRight, Globe, Key, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Endpoint {
  method: "GET" | "POST" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; description: string; required: boolean }[];
  response: string;
}

const endpoints: { category: string; icon: any; items: Endpoint[] }[] = [
  {
    category: "Authentication",
    icon: Key,
    items: [
      {
        method: "GET",
        path: "/api/auth/me",
        description: "Get the current authenticated user's details.",
        auth: true,
        response: `{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "name": "John",
    "telegramId": "123456789",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}`,
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "Invalidate the current session and clear the auth cookie.",
        auth: true,
        response: `{ "success": true }`,
      },
    ],
  },
  {
    category: "Dashboard",
    icon: Globe,
    items: [
      {
        method: "GET",
        path: "/api/dashboard",
        description: "Get all monitors, stats summary, and recent ping logs for the authenticated user.",
        auth: true,
        response: `{
  "stats": {
    "totalJobs": 3,
    "activeJobs": 2,
    "totalPings": 142,
    "avgLatency": 234,
    "uptime": 98
  },
  "jobs": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "interval": 5,
      "isActive": true,
      "lastPing": "2025-01-01T12:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "recentLogs": [
        {
          "id": "uuid",
          "success": true,
          "latency": 234,
          "statusCode": 200,
          "timestamp": "2025-01-01T12:00:00Z"
        }
      ]
    }
  ]
}`,
      },
    ],
  },
  {
    category: "Analytics",
    icon: BarChart3,
    items: [
      {
        method: "GET",
        path: "/api/analytics",
        description: "Get detailed analytics including hourly chart data, per-job stats, and recent logs.",
        auth: true,
        response: `{
  "logs": [...],
  "chartData": [
    { "time": "2025-01-01T12:00", "success": 5, "fail": 0, "avgLatency": 200 }
  ],
  "jobStats": [
    { "url": "https://example.com", "total": 50, "success": 49, "uptime": 98, "avgLatency": 220 }
  ]
}`,
      },
    ],
  },
  {
    category: "API Keys",
    icon: Zap,
    items: [
      {
        method: "GET",
        path: "/api/keys",
        description: "List all API keys for the authenticated user.",
        auth: true,
        response: `{
  "keys": [
    { "id": "uuid", "key": "pb_xxx...xxx", "name": "Production", "lastUsed": null, "createdAt": "..." }
  ]
}`,
      },
      {
        method: "POST",
        path: "/api/keys",
        description: "Create a new API key.",
        auth: true,
        params: [{ name: "name", type: "string", description: "Display name for the key", required: true }],
        response: `{ "key": { "id": "uuid", "key": "pb_xxx...xxx", "name": "Production", ... } }`,
      },
      {
        method: "DELETE",
        path: "/api/keys",
        description: "Revoke (delete) an API key.",
        auth: true,
        params: [{ name: "id", type: "string", description: "The key ID to revoke", required: true }],
        response: `{ "success": true }`,
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function DocsPage() {
  const [openEndpoint, setOpenEndpoint] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground mt-1.5">Integrate PingBot data into your own applications.</p>
      </div>

      {/* Quick Start */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-lg">Quick Start</h2>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>All API endpoints require authentication via your session cookie (set through Telegram login).</p>
          <div className="bg-muted/50 rounded-xl p-4 font-mono text-xs leading-relaxed border border-border/50">
            <p className="text-muted-foreground/60"># Example: Fetch your dashboard data</p>
            <p className="mt-1">
              <span className="text-emerald-500">curl</span> -X GET {`"http://localhost:3000/api/dashboard"`}
            </p>
            <p className="pl-4">
              -H {`"Cookie: session_token=your_token_here"`}
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 font-mono text-xs leading-relaxed border border-border/50">
            <p className="text-muted-foreground/60"># Example: Create an API key</p>
            <p className="mt-1">
              <span className="text-blue-500">curl</span> -X POST {`"http://localhost:3000/api/keys"`}
            </p>
            <p className="pl-4">
              -H {`"Content-Type: application/json"`}
            </p>
            <p className="pl-4">
              -H {`"Cookie: session_token=your_token_here"`}
            </p>
            <p className="pl-4">
              -d {`'{"name": "My Key"}'`}
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      {endpoints.map((cat) => (
        <div key={cat.category}>
          <div className="flex items-center gap-2 mb-4">
            <cat.icon className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{cat.category}</h2>
          </div>
          <div className="space-y-3">
            {cat.items.map((ep) => {
              const epKey = `${ep.method}-${ep.path}`;
              const isOpen = openEndpoint === epKey;
              return (
                <div key={epKey} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenEndpoint(isOpen ? null : epKey)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider", methodColors[ep.method])}>
                      {ep.method}
                    </span>
                    <code className="font-mono text-sm flex-1">{ep.path}</code>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyPath(ep.path); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                      {copiedPath === ep.path ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 border-t border-border/30 space-y-4">
                      <p className="text-sm text-muted-foreground pt-3">{ep.description}</p>

                      {ep.auth && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-500">
                          <Key className="w-3 h-3" />
                          <span>Requires authentication</span>
                        </div>
                      )}

                      {ep.params && ep.params.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parameters</h4>
                          <div className="bg-muted/30 rounded-xl overflow-hidden border border-border/30">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border/30">
                                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Name</th>
                                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Type</th>
                                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Required</th>
                                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ep.params.map((p) => (
                                  <tr key={p.name} className="border-b border-border/20 last:border-0">
                                    <td className="px-4 py-2 font-mono text-xs">{p.name}</td>
                                    <td className="px-4 py-2 text-xs text-muted-foreground">{p.type}</td>
                                    <td className="px-4 py-2 text-xs">{p.required ? "✓" : "—"}</td>
                                    <td className="px-4 py-2 text-xs text-muted-foreground">{p.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response</h4>
                        <pre className="bg-muted/30 rounded-xl p-4 text-xs font-mono border border-border/30 overflow-x-auto text-muted-foreground">
                          {ep.response}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
