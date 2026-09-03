import { Activity, Send, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl glow-primary mx-auto">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="gradient-text">PingBot</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Professional uptime monitoring with real-time analytics and Telegram integration.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-12 w-full animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="glass-card rounded-2xl p-8 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-[#0088cc]" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Login via Telegram</h2>
                <p className="text-xs text-muted-foreground">Secure authentication through your bot</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <p className="text-muted-foreground">
                  Open <span className="text-foreground font-medium">@YourPingBot</span> on Telegram
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <p className="text-muted-foreground">
                  Send the <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-foreground">/login</code> command
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
                <p className="text-muted-foreground">
                  Click the <span className="text-foreground font-medium">Open Dashboard</span> button
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <a
                href="https://t.me/YourPingBot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#0088cc]/25"
              >
                <Send className="w-4 h-4" />
                Open Telegram Bot
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-xs text-muted-foreground/50 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          🔒 Your session is encrypted and stored securely. No passwords required.
        </p>
      </div>
    </div>
  );
}
