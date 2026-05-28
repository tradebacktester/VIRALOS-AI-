import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Zap, Globe, Target, Users, TrendingUp,
  Layers, ChevronRight, Trash2, RefreshCw, DollarSign, Eye,
  Youtube, Instagram, Twitter, Play, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrandIdentity {
  id: number; prompt: string; brandName: string; tagline?: string; niche: string;
  missionStatement?: string; brandPersonality?: string[];
  targetAudience?: Record<string, string>;
  visualIdentity?: Record<string, unknown>;
  contentPillars?: Array<{ name: string; percentage: number; description: string; exampleHooks: string[] }>;
  channelStrategy?: Record<string, unknown>;
  thumbnailStyle?: string; channelName?: string; channelDescription?: string;
  introHook?: string; brandVoice?: string; competitorGaps?: string[];
  monetizationPath?: string; isDeployed?: boolean; createdAt: string;
}

interface Channel {
  id: number; name: string; niche: string; platform: string; handle?: string;
  status: string; followersCount?: string; avgViews?: string; monthlyRevenue?: string;
  contentPillar?: string; psychTarget?: string; createdAt: string;
}

const PLATFORM_ICONS: Record<string, React.FC<{ className?: string }>> = {
  tiktok: Play, youtube: Youtube, instagram: Instagram, twitter: Twitter,
};

const PSYCH_EMOTIONS = ["ambition", "loneliness", "fear", "ego", "revenge", "discipline", "success_addiction", "belonging"];

const EMOTION_COLORS: Record<string, string> = {
  ambition: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  loneliness: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  fear: "text-red-400 bg-red-400/10 border-red-400/20",
  ego: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  revenge: "text-red-600 bg-red-600/10 border-red-600/20",
  discipline: "text-primary bg-primary/10 border-primary/20",
  success_addiction: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  belonging: "text-pink-400 bg-pink-400/10 border-pink-400/20",
};

export default function BrandCreator() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<BrandIdentity[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [tab, setTab] = useState<"brands" | "channels" | "psychology">("brands");
  const [selected, setSelected] = useState<BrandIdentity | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [channelForm, setChannelForm] = useState({ name: "", niche: "", platform: "tiktok", handle: "", contentPillar: "", psychTarget: "ambition" });
  const [addingChannel, setAddingChannel] = useState(false);
  const [psychForm, setPsychForm] = useState({ topic: "", targetEmotion: "ambition", platform: "tiktok" });
  const [psychResult, setPsychResult] = useState<Record<string, unknown> | null>(null);
  const [analyzingPsych, setAnalyzingPsych] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([fetch("/api/brand/brands"), fetch("/api/brand/channels")]);
      const [br, ch] = await Promise.all([bRes.json(), cRes.json()]);
      setBrands(Array.isArray(br) ? br : []);
      setChannels(Array.isArray(ch) ? ch : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const buildBrand = async () => {
    if (!prompt.trim()) { toast({ title: "Describe your empire", variant: "destructive" }); return; }
    setBuilding(true);
    try {
      const res = await fetch("/api/brand/brands/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const result = await res.json();
      const brand = result.data ?? result;
      toast({ title: `Brand created — ${brand.brandName}` });
      setPrompt("");
      fetchAll();
    } catch { toast({ title: "Build failed", variant: "destructive" }); }
    finally { setBuilding(false); }
  };

  const deleteBrand = async (id: number) => {
    await fetch(`/api/brand/brands/${id}`, { method: "DELETE" });
    setBrands((p) => p.filter((b) => b.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const addChannel = async () => {
    if (!channelForm.name || !channelForm.niche) { toast({ title: "Fill name and niche", variant: "destructive" }); return; }
    setAddingChannel(true);
    try {
      const res = await fetch("/api/brand/channels", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelForm),
      });
      const ch = await res.json();
      setChannels((p) => [ch, ...p]);
      setShowChannelForm(false);
      setChannelForm({ name: "", niche: "", platform: "tiktok", handle: "", contentPillar: "", psychTarget: "ambition" });
      toast({ title: `Channel added — ${ch.name}` });
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setAddingChannel(false); }
  };

  const analyzePsychology = async () => {
    if (!psychForm.topic) { toast({ title: "Enter a topic", variant: "destructive" }); return; }
    setAnalyzingPsych(true);
    try {
      const res = await fetch("/api/brand/psychology", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(psychForm),
      });
      const data = await res.json();
      setPsychResult(data.data ?? data);
      toast({ title: "Psychological blueprint built" });
    } catch { toast({ title: "Analysis failed", variant: "destructive" }); }
    finally { setAnalyzingPsych(false); }
  };

  const TABS = [
    { id: "brands", label: "Brand Builder", icon: Sparkles },
    { id: "channels", label: "Multi-Channel", icon: Layers },
    { id: "psychology", label: "Psychology Engine", icon: Target },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="w-6 h-6 text-emerald-400" /> Brand Creation Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Type one sentence. Get a complete brand empire — name, identity, content pillars, channel strategy, monetization.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Brand Builder */}
      {tab === "brands" && (
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-emerald-400/20 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-foreground">Build a Brand Empire</h2>
            </div>
            <p className="text-xs text-muted-foreground">One sentence. AI builds the entire brand — name, visual identity, content strategy, channel setup, monetization.</p>
            <div className="flex gap-3">
              <input value={prompt} onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buildBrand()}
                placeholder={`"Build an MMA motivation empire." or "Create a luxury finance brand for Gen Z."`}
                className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50" />
              <button onClick={buildBrand} disabled={building || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 shrink-0">
                {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {building ? "Building..." : "Build Empire"}
              </button>
            </div>
          </div>

          {loading && brands.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map((i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {brands.map((brand) => {
              const vi = brand.visualIdentity as Record<string, unknown> | undefined;
              const primaryColor = String(vi?.primaryColor ?? "#3b82f6");
              return (
                <motion.div key={brand.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl border border-border overflow-hidden">
                  {/* Brand color bar */}
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${primaryColor}, ${String(vi?.secondaryColor ?? "#8b5cf6")})` }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-black text-foreground">{brand.brandName}</h3>
                        {brand.tagline && <p className="text-xs text-muted-foreground italic">{brand.tagline}</p>}
                      </div>
                      <button onClick={() => deleteBrand(brand.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(brand.brandPersonality ?? []).map((p) => (
                        <span key={p} className="text-[10px] px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground">{p}</span>
                      ))}
                    </div>

                    {brand.channelName && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-foreground font-medium">{brand.channelName}</span>
                        <span className="text-[10px] text-muted-foreground">{brand.niche}</span>
                      </div>
                    )}

                    {brand.introHook && (
                      <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border mb-3">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Signature Hook</p>
                        <p className="text-xs text-foreground italic">"{brand.introHook}"</p>
                      </div>
                    )}

                    {/* Content pillars */}
                    {brand.contentPillars && brand.contentPillars.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content Pillars</p>
                        <div className="flex gap-1">
                          {brand.contentPillars.slice(0, 4).map((pillar, i) => (
                            <div key={i} className="flex-1 text-center p-1.5 rounded-lg bg-muted/20 border border-border">
                              <p className="text-[9px] font-bold text-foreground">{pillar.percentage}%</p>
                              <p className="text-[8px] text-muted-foreground truncate">{pillar.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {brand.monetizationPath && (
                      <div className="flex items-start gap-1.5">
                        <DollarSign className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{brand.monetizationPath}</p>
                      </div>
                    )}

                    <button onClick={() => setSelected(brand === selected ? null : brand)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> {selected?.id === brand.id ? "Hide Details" : "Full Brand Brief"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {selected?.id === brand.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
                          {brand.missionStatement && (
                            <div>
                              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mission</p>
                              <p className="text-xs text-foreground">{brand.missionStatement}</p>
                            </div>
                          )}
                          {brand.targetAudience && (
                            <div>
                              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Audience</p>
                              <div className="grid grid-cols-2 gap-1">
                                {Object.entries(brand.targetAudience).map(([k, v]) => (
                                  <div key={k} className="p-1.5 rounded-lg bg-muted/20">
                                    <p className="text-[8px] text-muted-foreground capitalize">{k}</p>
                                    <p className="text-[10px] text-foreground">{v}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {brand.competitorGaps && brand.competitorGaps.length > 0 && (
                            <div>
                              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Competitor Gaps to Exploit</p>
                              {brand.competitorGaps.map((g, i) => (
                                <p key={i} className="text-[10px] text-foreground flex items-start gap-1.5 mb-1">
                                  <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />{g}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Multi-Channel */}
      {tab === "channels" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowChannelForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Layers className="w-4 h-4" /> Add Channel
            </button>
          </div>

          <AnimatePresence>
            {showChannelForm && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass rounded-xl border border-primary/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Add Channel to Network</h3>
                  <button onClick={() => setShowChannelForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: "name", label: "Channel Name", placeholder: "Dark Empire" },
                    { key: "niche", label: "Niche", placeholder: "dark motivation" },
                    { key: "handle", label: "@Handle", placeholder: "@darkempire" },
                    { key: "contentPillar", label: "Content Pillar", placeholder: "Inspiration" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
                      <input value={channelForm[key as keyof typeof channelForm]} onChange={(e) => setChannelForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder} className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
                    <select value={channelForm.platform} onChange={(e) => setChannelForm((p) => ({ ...p, platform: e.target.value }))}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      {["tiktok","youtube","instagram","twitter"].map((pl) => <option key={pl} value={pl}>{pl}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Psych Target</label>
                    <select value={channelForm.psychTarget} onChange={(e) => setChannelForm((p) => ({ ...p, psychTarget: e.target.value }))}
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      {PSYCH_EMOTIONS.map((e) => <option key={e} value={e}>{e.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={addChannel} disabled={addingChannel}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {addingChannel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  Add to Network
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {channels.length === 0 ? (
            <div className="py-12 text-center glass rounded-xl border border-border">
              <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No channels in your network</p>
              <p className="text-xs text-muted-foreground mt-1">Add channels to manage multiple niches and audiences simultaneously</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((ch) => {
                const Icon = PLATFORM_ICONS[ch.platform] ?? Play;
                const emotionStyle = EMOTION_COLORS[ch.psychTarget ?? "ambition"] ?? EMOTION_COLORS.ambition;
                return (
                  <motion.div key={ch.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{ch.name}</p>
                          <p className="text-xs text-muted-foreground">{ch.handle ?? ch.niche}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold ${ch.status === "active" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-muted/30 text-muted-foreground border-border"}`}>
                        {ch.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[["Followers", ch.followersCount ?? "0"], ["Avg Views", ch.avgViews ?? "0"], ["Revenue", ch.monthlyRevenue ?? "$0"]].map(([label, val]) => (
                        <div key={label} className="text-center p-1.5 rounded-lg bg-muted/20">
                          <p className="text-xs font-bold text-foreground">{val}</p>
                          <p className="text-[9px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                    {ch.psychTarget && (
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${emotionStyle}`}>
                        ⚡ {ch.psychTarget.replace(/_/g, " ")}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Psychology Engine */}
      {tab === "psychology" && (
        <div className="space-y-6">
          <div className="glass rounded-xl border border-red-400/20 p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" /> Psychological Content Engine
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Target specific emotional drivers — ambition, loneliness, fear, ego, revenge, discipline. AI engineers content that hijacks those psychological states.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Content Topic</label>
                <input value={psychForm.topic} onChange={(e) => setPsychForm((p) => ({ ...p, topic: e.target.value }))}
                  placeholder="Working 16 hours while they sleep" className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500/40" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
                <select value={psychForm.platform} onChange={(e) => setPsychForm((p) => ({ ...p, platform: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-red-500/40">
                  {["tiktok","youtube","instagram"].map((pl) => <option key={pl} value={pl}>{pl}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Target Emotion</label>
              <div className="flex flex-wrap gap-2">
                {PSYCH_EMOTIONS.map((em) => {
                  const style = EMOTION_COLORS[em] ?? "";
                  const active = psychForm.targetEmotion === em;
                  return (
                    <button key={em} onClick={() => setPsychForm((p) => ({ ...p, targetEmotion: em }))}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors ${active ? style : "border-border text-muted-foreground hover:text-foreground"}`}>
                      {em.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={analyzePsychology} disabled={analyzingPsych || !psychForm.topic}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50">
              {analyzingPsych ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {analyzingPsych ? "Engineering psychology..." : "Build Psychological Blueprint"}
            </button>
          </div>

          <AnimatePresence>
            {psychResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass rounded-xl border border-border p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Optimized Hook", value: psychResult.optimizedHook, color: "text-yellow-400" },
                      { label: "Shareability Driver", value: psychResult.shareabilityDriver, color: "text-pink-400" },
                      { label: "Retention Strategy", value: psychResult.retentionStrategy, color: "text-primary" },
                      { label: "Addiction Loop", value: psychResult.addictionLoop, color: "text-red-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-3 rounded-lg bg-muted/20 border border-border">
                        <p className={`text-[9px] font-semibold uppercase tracking-wider ${color} mb-1`}>{label}</p>
                        <p className="text-xs text-foreground">{String(value ?? "")}</p>
                      </div>
                    ))}
                  </div>
                  {Array.isArray(psychResult.dopamineHits) && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dopamine Hit Timeline</p>
                      <div className="flex flex-wrap gap-2">
                        {(psychResult.dopamineHits as string[]).map((h, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{h}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {psychResult.contentBlueprint && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content Blueprint</p>
                      <p className="text-xs text-foreground whitespace-pre-wrap">{String(psychResult.contentBlueprint)}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
