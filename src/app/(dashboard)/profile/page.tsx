"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Key,
  Copy,
  Check,
  Trash2,
  Plus,
  Calendar,
  Hash,
  AtSign,
  AlertTriangle,
  LogOut,
  Sparkles,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string | null;
  telegramId: string;
  photoUrl: string | null;
  createdAt: string;
}

interface ApiKeyData {
  id: string;
  key: string;
  name: string;
  lastUsed: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/keys").then((r) => r.json()),
    ]).then(([userData, keysData]) => {
      if (userData.authenticated) setUser(userData.user);
      setKeys(keysData.keys || []);
      setLoading(false);
    });
  }, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });
    const data = await res.json();
    setKeys([data.key, ...keys]);
    setShowNewKey(data.key.key);
    setNewKeyName("");
    setCreatingKey(false);
  };

  const confirmDeleteKey = async () => {
    if (!keyToDelete) return;
    setDeleting(true);
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: keyToDelete }),
    });
    setKeys(keys.filter((k) => k.id !== keyToDelete));
    setKeyToDelete(null);
    setDeleting(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-full space-y-8 animate-fade-in-up">
        <div className="h-10 w-52 shimmer rounded-lg" />
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="h-72 shimmer rounded-2xl lg:col-span-1" />
            <div className="lg:col-span-3 h-72 shimmer rounded-2xl" />
          </div>
          <div className="w-full h-48 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  // Get initials for fallback avatar (safe for emojis)
  const initials = user?.name
    ? Array.from(user.name)
        .filter(c => /[a-zA-Z]/.test(c))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="w-full space-y-6 animate-fade-in-up flex flex-col min-h-[calc(100vh-2rem)]">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1.5">Manage your account and API keys.</p>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* ── Top Row (User + Keys) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:items-stretch">
          
          {/* ── User Card ── */}
          <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              {/* Avatar */}
              <div className="relative mb-6">
                {user?.photoUrl ? (
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg">
                    <img
                      src={user.photoUrl}
                      alt={user.name || "Profile"}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold ring-4 ring-primary/20 shadow-lg">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full border-[3px] border-card flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-success-foreground" />
                </div>
              </div>

              {/* Name */}
              <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>

              {/* Info Rows */}
              <div className="w-full mt-6 space-y-3 text-sm">
                {user?.username && (
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40 transition-colors hover:bg-muted/60">
                    <AtSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">@{user.username}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40 transition-colors hover:bg-muted/60">
                  <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">ID: {user?.telegramId}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40 transition-colors hover:bg-muted/60">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    Joined {user ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40 transition-colors hover:bg-muted/60">
                  <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{keys.length} API Key{keys.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* Logout Button sticks to bottom */}
            <div className="w-full mt-8 pt-6 border-t border-border/30">
              <button
                onClick={handleLogout}
                className="w-full py-3 text-sm font-semibold text-destructive/80 border border-destructive/20 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* ── API Keys Section ── */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-6 lg:p-8 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-inner">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">API Keys</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Access your data programmatically</p>
              </div>
            </div>

            {/* Create Key */}
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. Production Server)"
                className="flex-1 min-w-0 h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-muted/50"
                onKeyDown={(e) => e.key === "Enter" && createKey()}
              />
              <button
                onClick={createKey}
                disabled={!newKeyName.trim() || creatingKey}
                className="h-12 px-6 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-lg hover:shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Key</span>
              </button>
            </div>

            {/* New key reveal */}
            {showNewKey && (
              <div className="mb-8 p-5 bg-warning/5 border border-warning/20 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <p className="text-sm font-semibold text-warning mb-2">Copy your key now — won&apos;t be shown again!</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <code className="flex-1 text-[13px] font-mono bg-background/80 px-4 py-2.5 rounded-xl border border-border/50 break-all text-foreground shadow-inner">
                        {showNewKey}
                      </code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(showNewKey); setShowNewKey(null); }}
                        className="h-[42px] px-4 rounded-xl bg-warning/10 text-warning hover:bg-warning/20 transition-colors flex items-center justify-center gap-2 font-medium flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy & Dismiss</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key List */}
            <div className="flex-1 flex flex-col">
              {keys.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-muted/20 border border-border/30 border-dashed my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h4 className="text-base font-semibold mb-1">No API keys yet</h4>
                  <p className="text-sm text-muted-foreground">Create a new key above to get started.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 pb-2">
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/40 group hover:border-border/80 hover:bg-muted/40 transition-all shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{k.name}</p>
                        <p className="text-[13px] text-muted-foreground/80 mt-1 truncate font-mono">
                          {k.key.slice(0, 12)}{"•".repeat(24)}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1.5 font-medium">
                          Created {new Date(k.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto border-t sm:border-0 border-border/50 pt-3 sm:pt-0 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                        <button
                          onClick={() => copyToClipboard(k.key, k.id)}
                          className="p-2.5 rounded-xl text-muted-foreground hover:bg-background hover:shadow-sm hover:text-foreground transition-all flex-shrink-0"
                          title="Copy key"
                        >
                          {copiedId === k.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setKeyToDelete(k.id)}
                          className="p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0 sm:opacity-0 group-hover:opacity-100"
                          title="Revoke key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Row (Security) ── */}
        <div className="glass-card rounded-2xl p-6 lg:p-8 w-full mt-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 shadow-inner">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Security & Authentication</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Session managed securely through Telegram</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <span className="text-success text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold block mb-1">Encrypted Sessions</strong>
                Your login sessions are fully encrypted and automatically expire after 7 days for safety.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <span className="text-success text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold block mb-1">Passwordless Auth</strong>
                No passwords stored on our servers — authentication is handled entirely via Telegram.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <span className="text-success text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold block mb-1">Instant Revocation</strong>
                API keys can be revoked instantly from this dashboard to cut off access immediately.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <span className="text-success text-xs font-bold">✓</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold block mb-1">Programmatic Access</strong>
                All API requests are authenticated individually using your unique, secure API keys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-bold">Revoke API Key?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to revoke this key? Any applications using it will immediately lose access. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setKeyToDelete(null)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteKey}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-semibold bg-destructive text-destructive-foreground rounded-xl shadow-md hover:shadow-destructive/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
