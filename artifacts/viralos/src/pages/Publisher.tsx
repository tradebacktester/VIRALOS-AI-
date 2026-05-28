import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Youtube, Instagram, Twitter, Play, Clock, CheckCircle,
  AlertCircle, Plus, Trash2, Loader2, RefreshCw, Zap, BarChart3,
  Hash, FileText, Image, TrendingUp, ArrowRight, Radio,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLATFORM_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.FC<{ className?: string }> }> = {
  youtube: { label: "YouTube Shorts", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: Youtube },
  tiktok: { label: "TikTok", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20", icon: Play },
  instagram: { label: "Instagram Reels", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: Instagram },
  twitter: { label: "X / Twitter", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20", icon: Twitter },
  snapchat: { label: "Snapchat", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: Zap },
};

interface SocialAccount { id: number; platform: string; accountName: string; followersCount: string; avgViews: string; niche?: string; isConnected: boolean; }
interface ScheduledPost { id: number; platform: string; status: string; scheduledAt: string; title?: string; description?: string; hashtags?: string[]; }
interface GeneratedMeta { title: string; description: string; hashtags: string[]; altTitles: string[]; cta: string; bestUploadTime: string; thumbnailConcept: string; }
interface RepostCandidate { id: number; projectId?: number; platform: string; views: number; avgWatchPct: number; engagementRate: number; repostSuggestion: string; }

const statusBadge = (status: string) => {
  if (status === "posted") return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
  if (status === "scheduled") return "bg-primary/10 text-primary border-primary/20";
  if (status === "failed") return "bg-red-400/10 text-red-400 border-red-400/20";
  return "bg-muted/50 text-muted-foreground border-border";
};

export default function Publisher() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [candidates, setCandidates] = useState<RepostCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"accounts" | "schedule" | "repost" | "metadata">("accounts");

  const [addingAccount, setAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({ platform: "tiktok", accountName: "", niche: "", followersCount: "", avgViews: "" });

  const [metaTopic, setMetaTopic] = useState("");
  const [metaPlatform, setMetaPlatform] = useState("tiktok");
  const [generatingMeta, setGeneratingMeta] = useState(false);
  const [generatedMeta, setGeneratedMeta] = useState<GeneratedMeta | null>(null);

  const [simulating, setSimulating] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [acRes, postRes, repRes] = await Promise.all([
        fetch("/api/publisher/accounts"),
        fetch("/api/publisher/scheduled"),
        fetch("/api/publisher/repost-candidates"),
      ]);
      const [ac, po, re] = await Promise.all([acRes.json(), postRes.json(), repRes.json()]);
      setAccounts(Array.isArray(ac) ? ac : []);
      setPosts(Array.isArray(po) ? po : []);
      setCandidates(Array.isArray(re) ? re : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addAccount = async () => {
    if (!newAccount.accountName.trim()) { toast({ title: "Enter account name", variant: "destructive" }); return; }
    try {
      const res = await fetch("/api/publisher/accounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });
      const acc = await res.json();
      setAccounts((p) => [acc, ...p]);
      setNewAccount({ platform: "tiktok", accountName: "", niche: "", followersCount: "", avgViews: "" });
      setAddingAccount(false);
      toast({ title: `${PLATFORM_META[newAccount.platform]?.label} account connected` });
    } catch { toast({ title: "Failed to connect", variant: "destructive" }); }
  };

  const deleteAccount = async (id: number) => {
    await fetch(`/api/publisher/accounts/${id}`, { method: "DELETE" });
    setAccounts((p) => p.filter((a) => a.id !== id));
  };

  const generateMeta = async () => {
    if (!metaTopic.trim()) { toast({ title: "Enter a topic", variant: "destructive" }); return; }
    setGeneratingMeta(true);
    try {
      const res = await fetch("/api/publisher/generate-metadata", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: metaTopic, platform: metaPlatform }),
      });
      setGeneratedMeta(await res.json());
      toast({ title: "Metadata generated!" });
    } catch { toast({ title: "Generation failed", variant: "destructive" }); }
    finally { setGeneratingMeta(false); }
  };

  const simulatePost = async (id: number) => {
    setSimulating(id);
    try {
      const res = await fetch(`/api/publisher/simulate-post/${id}`, { method: "POST" });
      const { post } = await res.json();
      setPosts((p) => p.map((x) => x.id === id ? { ...x, status: "posted" } : x));
      toast({ title: `Posted! ${post.platform} · ${PLATFORM_META[post.platform]?.label}` });
      fetchAll();
    } catch { toast({ title: "Post failed", variant: "destructive" }); }
    finally { setSimulating(null); }
  };

  const TABS = [
    { id: "accounts", label: "Connected Accounts", icon: Radio },
    { id: "schedule", label: "Post Schedule", icon: Clock },
    { id: "repost", label: "Auto Repost", icon: RefreshCw },
    { id: "metadata", label: "AI Metadata", icon: Zap },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" /> Auto Publisher
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Autonomous posting across YouTube, TikTok, Instagram, X and Snapchat</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
        </button>
      </div>

      {/* Platform Status Strip */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {Object.entries(PLATFORM_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const connected = accounts.filter((a) => a.platform === key).length;
          return (
            <div key={key} className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${connected > 0 ? meta.border + " " + meta.bg : "border-border bg-muted/20"}`}>
              <Icon className={`w-4 h-4 ${connected > 0 ? meta.color : "text-muted-foreground"}`} />
              <div>
                <p className="text-xs font-semibold text-foreground">{meta.label}</p>
                <p className={`text-[10px] ${connected > 0 ? meta.color : "text-muted-foreground"}`}>
                  {connected > 0 ? `${connected} account${connected > 1 ? "s" : ""} connected` : "Not connected"}
                </p>
              </div>
              {connected > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto animate-pulse" />}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Accounts tab */}
      {tab === "accounts" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setAddingAccount(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Connect Account
            </button>
          </div>

          <AnimatePresence>
            {addingAccount && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass rounded-xl border border-primary/20 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Connect Social Account</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
                    <select value={newAccount.platform} onChange={(e) => setNewAccount((p) => ({ ...p, platform: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      {Object.entries(PLATFORM_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">@Handle</label>
                    <input value={newAccount.accountName} onChange={(e) => setNewAccount((p) => ({ ...p, accountName: e.target.value }))}
                      placeholder="@yourhandle" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Niche</label>
                    <input value={newAccount.niche} onChange={(e) => setNewAccount((p) => ({ ...p, niche: e.target.value }))}
                      placeholder="dark motivation, finance..." className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Followers</label>
                    <input value={newAccount.followersCount} onChange={(e) => setNewAccount((p) => ({ ...p, followersCount: e.target.value }))}
                      placeholder="e.g. 15K" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={addAccount} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Connect</button>
                  <button onClick={() => setAddingAccount(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {accounts.length === 0 ? (
            <div className="py-16 text-center glass rounded-xl border border-border">
              <Upload className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No accounts connected yet</p>
              <p className="text-xs text-muted-foreground mt-1">Connect your social accounts to start auto-publishing</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => {
                const meta = PLATFORM_META[acc.platform] ?? PLATFORM_META.tiktok;
                const Icon = meta.icon;
                return (
                  <motion.div key={acc.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className={`glass rounded-xl border ${meta.border} p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${meta.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{acc.accountName}</p>
                          <p className={`text-xs ${meta.color}`}>{meta.label}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteAccount(acc.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[["Followers", acc.followersCount], ["Avg Views", acc.avgViews], ["Niche", acc.niche ?? "—"]].map(([label, val]) => (
                        <div key={label} className="text-center">
                          <p className="text-xs font-bold text-foreground">{val}</p>
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400">Connected · Auto-posting enabled</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedule tab */}
      {tab === "schedule" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="py-16 text-center glass rounded-xl border border-border">
              <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No scheduled posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create a video and schedule it for posting</p>
            </div>
          ) : (
            posts.map((post) => {
              const meta = PLATFORM_META[post.platform] ?? PLATFORM_META.tiktok;
              const Icon = meta.icon;
              return (
                <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-xl border border-border p-4 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{post.title ?? "Untitled post"}</p>
                    <p className="text-xs text-muted-foreground">{meta.label} · {new Date(post.scheduledAt).toLocaleString()}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.hashtags.slice(0, 4).map((h, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${statusBadge(post.status)}`}>
                      {post.status}
                    </span>
                    {post.status === "scheduled" && (
                      <button onClick={() => simulatePost(post.id)} disabled={simulating === post.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
                        {simulating === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Post Now
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Repost tab */}
      {tab === "repost" && (
        <div className="space-y-4">
          <div className="glass rounded-xl border border-amber-400/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Auto Repost Engine</h3>
            </div>
            <p className="text-xs text-muted-foreground">Videos that performed well are candidates for reposting with optimized hooks, new captions, or adapted pacing.</p>
          </div>
          {candidates.length === 0 ? (
            <div className="py-12 text-center glass rounded-xl border border-border">
              <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No repost candidates yet</p>
              <p className="text-xs text-muted-foreground mt-1">Post videos to build your repost pipeline</p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((c) => {
                const meta = PLATFORM_META[c.platform] ?? PLATFORM_META.tiktok;
                return (
                  <div key={c.id} className={`glass rounded-xl border ${meta.border} p-4 flex items-center gap-4`}>
                    <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                      <TrendingUp className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.views.toLocaleString()} views · {Math.round((c.avgWatchPct ?? 0))}% avg watch</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.repostSuggestion}</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-medium hover:bg-amber-400/20 transition-colors">
                      <RefreshCw className="w-3 h-3" /> Repost
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Metadata tab */}
      {tab === "metadata" && (
        <div className="space-y-4">
          <div className="glass rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> AI Metadata Generator</h3>
            <p className="text-xs text-muted-foreground">Generate viral titles, descriptions, hashtags, and thumbnail concepts optimized per platform.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input value={metaTopic} onChange={(e) => setMetaTopic(e.target.value)}
                  placeholder="Video topic or concept..."
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <select value={metaPlatform} onChange={(e) => setMetaPlatform(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                  {Object.entries(PLATFORM_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={generateMeta} disabled={generatingMeta || !metaTopic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {generatingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate Metadata
            </button>
          </div>

          <AnimatePresence>
            {generatedMeta && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass rounded-xl border border-primary/20 p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Title</p>
                    <p className="text-sm font-bold text-foreground">{generatedMeta.title}</p>
                    <div className="mt-2 space-y-1">
                      {generatedMeta.altTitles?.map((t, i) => (
                        <p key={i} className="text-xs text-muted-foreground">Alt {i + 1}: {t}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Description</p>
                    <p className="text-sm text-foreground">{generatedMeta.description}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Hash className="w-3 h-3" /> Hashtags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedMeta.hashtags?.map((h, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Best Upload Time</p>
                      <p className="text-sm font-bold text-emerald-400">{generatedMeta.bestUploadTime}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><Image className="w-3 h-3" /> Thumbnail Concept</p>
                      <p className="text-xs text-foreground">{generatedMeta.thumbnailConcept}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
