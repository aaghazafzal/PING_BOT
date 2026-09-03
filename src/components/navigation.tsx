"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  UserCircle,
  Moon,
  Sun,
  Activity,
  BookOpen,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "API Docs", href: "/docs", icon: BookOpen },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

// ── Desktop Sidebar ──
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] border-r border-border/40 bg-sidebar h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-shadow duration-300">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-sidebar animate-pulse-dot" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight">PingBot</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Monitor</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em]">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute inset-0 bg-primary/[0.08] rounded-xl border border-primary/15"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-[17px] h-[17px] relative z-10 flex-shrink-0" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-0.5 border-t border-border/40">
        <button
          onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {mounted && theme === "dark" ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
          <span>{mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Theme"}</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-[17px] h-[17px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// ── Mobile Top Header ──
export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-12 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-sm">PingBot</span>
      </Link>
      <button
        onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}

// ── Mobile Bottom Nav (Pill Shaped) ──
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 safe-bottom">
      <nav className="flex items-center justify-around bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl shadow-black/10 px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-pill"
                  className="absolute inset-0 bg-primary/[0.1] rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="w-[18px] h-[18px] relative z-10" />
              <span className="text-[9px] font-semibold relative z-10 tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
