import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Brain, Eye, Zap, Target, Type, TrendingUp, Sparkles,
  Play, ChevronRight, CheckCircle, Loader2, AlertCircle, BarChart3,
  RefreshCw, Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AGENTS = [
  {
    id: "trend",
    name: "Trend Agent",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    description: "Scans YouTube, TikTok, Reddit, X & Google for rising trends, viral sounds, and emotional patterns.",
    capabilities: ["Rising trend detection", "Viral sound analysis", "Emotional pattern mapping", "Daily trend reports"],
  },
  {
    id: "hook",
    name: "Hook Agent",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    description: "Obsessed with the first 2 seconds. Generates 10 hook variations ranked by predicted retention.",
    capabilities: ["Curiosity gap creation", "Emotional triggers", "Controversy openings", "Attention capture"],
  },
  {
    id: "emotion",
    name: "Emotion Agent",
    icon: Brain,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    description: "Controls emotional pacing, tension building, and dopamine spikes for maximum bingeability.",
    capabilities: ["Emotion arc mapping", "Dopamine spike timing", "Tension building", "Replay optimization"],
  },
  {
    id: "visual",
    name: "Visual Director",
    icon: Eye,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    description: "Creates cinematic storyboards, camera movement plans, and color tone strategies.",
    capabilities: ["Cinematic storyboard", "Camera motion", "Color palette", "Scene intensity map"],
  },
  {
    id: "retention",
    name: "Retention Agent",
    icon: Activity,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    description: "Analyzes boring sections and pacing drops, then auto-inserts pattern interrupts.",
    capabilities: ["Dead moment detection", "Pacing optimization", "Pattern interrupts", "Weak transition fixes"],
  },
  {
    id: "caption",
    name: "Caption Agent",
    icon: Type,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    description: "Creates Hormozi-style, dark cinematic, anime edit, and dopamine typography captions.",
    capabilities: ["Alex Hormozi style", "Dark cinematic", "Anime edit subs", "Dopamine typography"],
  },
  {
    id: "virality",
    name: "Virality Engine",
    icon: BarChart3,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    description: "Predicts viral probability across 6 dimensions: hook strength, emotion, curiosity, replay, retention, shareability.",
    capabilities: ["Viral probability score", "Hook strength", "Retention prediction", "Shareability score"],
  },
  {
    id: "memory",
    name: "AI Memory",
    icon: Sparkles,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    description: "Remembers best-performing hooks, pacing styles, caption styles, and audience preferences across sessions.",
    capabilities: ["Hook memory bank", "Pacing style recall", "Caption preferences", "Cross-session learning"],
  },
];

type RunMode = "full_pipeline" | "hooks_only" | "virality_check" | "visual_only" | "captions_only";

interface AgentRunResult {
  runId?: number;
  status: string;
  hooks?: { topHook?: { hook: string; predicted_retention: number; style: string }; hooks?: Array<{ hook: string; rank: number; predicted_retention: number; style: string; emotional_trigger: string }> };
  emotion?: { bingeabilityScore?: number; replayScore?: number; dopamineSpikes?: number[]; tensionPoints?: string[] };
  virality?: { viral_probability?: number; hook_score?: number; retention_prediction?: string; strengths?: string[]; weaknesses?: string[]; recommendations?: string[] };
  visuals?: { storyboard?: Array<{ scene: string; camera_motion: string; emotion: string; visual_style: string }>; overallTone?: string; colorStrategy?: string };
  retention?: { retentionScore?: number; patternInterrupts?: Array<{ type: string; description: string }>; boringSegments?: unknown[] };
  captions?: { captionSets?: Array<{ style: string; styleDescription: string }>; recommendedStyle?: string };
  allLogs?: Array<{ agent: string; message: string; timestamp: string }>;
  error?: string;
}

export default function AgentStudio() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [niche, setNiche] = useState("");
  const [mode, setMode] = useState<RunMode>("full_pipeline");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AgentRunResult | null>(null);
  const [activeTab, setActiveTab] = useState<"hooks" | "emotion" | "visuals" | "virality" | "captions" | "logs">("virality");
  const [trendScanning, setTrendScanning] = useState(false);
  const [trendResult, setTrendResult] = useState<null | { data?: { risingTrends?: Array<{ topic: string; platform: string; momentum: string; emotional_pattern: string }>; viralSounds?: string[]; summary?: string } }>(null);

  const runAgents = async () => {
    if (!prompt.trim()) { toast({ title: "Enter a video concept", variant: "destructive" }); return; }
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platform, niche: niche || undefined, mode }),
      });
      const data = await res.json() as AgentRunResult;
      setResult(data);
      if (data.virality) setActiveTab("virality");
      else if (data.hooks) setActiveTab("hooks");
      toast({ title: data.status === "completed" ? "Agents completed!" : "Run finished", description: `Run #${data.runId}` });
    } catch {
      toast({ title: "Agent run failed", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const scanTrends = async () => {
    setTrendScanning(true);
    try {
      const res = await fetch("/api/agents/trends/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setTrendResult(data);
      toast({ title: "Trend scan complete!" });
    } catch {
      toast({ title: "Trend scan failed", variant: "destructive" });
    } finally {
      setTrendScanning(false);
    }
  };

  const viralColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const viralBg = (score: number) => {
    if (score >= 75) return "bg-emerald-400";
    if (score >= 50) return "bg-yellow-400";
    return "bg-red-400";
  };

  const tabs = [
    { id: "virality", label: "Virality", show: !!result?.virality },
    { id: "hooks", label: "Hooks", show: !!result?.hooks },
    { id: "emotion", label: "Emotion", show: !!result?.emotion },
    { id: "visuals", label: "Visuals", show: !!result?.visuals },
    { id: "captions", label: "Captions", show: !!result?.captions },
    { id: "logs", label: "Logs", show: !!(result?.allLogs?.length) },
  ].filter((t) => t.show) as Array<{ id: typeof activeTab; label: string }>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" /> AI Agent Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Multi-agent autonomous content creation — Jarvis for viral media</p>
        </div>
        <button
          onClick={scanTrends}
          disabled={trendScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
        >
          {trendScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Scan Trends
        </button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className={`glass rounded-xl border ${agent.border} p-4 cursor-default`}
            >
              <div className={`w-8 h-8 rounded-lg ${agent.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${agent.color}`} />
              </div>
              <p className="text-xs font-semibold text-foreground">{agent.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Trend scan result */}
      <AnimatePresence>
        {trendResult?.data && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-xl border border-emerald-400/20 p-5">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Latest Trend Report
            </h3>
            <p className="text-xs text-muted-foreground mb-3">{trendResult.data.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rising Trends</p>
                <div className="space-y-1.5">
                  {trendResult.data.risingTrends?.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${t.momentum === "rising" ? "bg-emerald-400/15 text-emerald-400" : "bg-yellow-400/15 text-yellow-400"}`}>{t.momentum}</span>
                      <span className="text-xs text-foreground truncate">{t.topic}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Viral Sounds</p>
                <div className="flex flex-wrap gap-1.5">
                  {trendResult.data.viralSounds?.slice(0, 6).map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Run Panel */}
      <div className="glass rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" /> Run Agent Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Video Concept / Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Why most people never achieve their goals — dark motivation"
              rows={2}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
              <option value="tiktok">TikTok</option>
              <option value="youtube_shorts">YouTube Shorts</option>
              <option value="reels">Instagram Reels</option>
              <option value="x_clips">X Clips</option>
              <option value="all">All Platforms</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Niche (optional)</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. dark motivation, finance, fitness"
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Agent Mode</label>
            <div className="flex flex-wrap gap-2">
              {([
                ["full_pipeline", "Full Pipeline", "All 6 agents"],
                ["hooks_only", "Hooks Only", "Hook Agent"],
                ["virality_check", "Virality Check", "Emotion + Virality"],
                ["visual_only", "Visual Only", "Visual Director"],
                ["captions_only", "Captions Only", "Caption Agent"],
              ] as const).map(([val, label, sub]) => (
                <button key={val} onClick={() => setMode(val)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${mode === val ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}>
                  {label}
                  <span className="block text-[10px] opacity-60">{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={runAgents}
          disabled={running || !prompt.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-blue"
        >
          {running ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running Agents...</>
          ) : (
            <><Play className="w-4 h-4" /> Run Agents</>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Status bar */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium ${
              result.status === "completed" ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
              : result.status === "failed" ? "bg-red-400/10 border-red-400/20 text-red-400"
              : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
            }`}>
              {result.status === "completed" ? <CheckCircle className="w-4 h-4" />
                : result.status === "failed" ? <AlertCircle className="w-4 h-4" />
                : <Loader2 className="w-4 h-4 animate-spin" />}
              Run #{result.runId} — {result.status}
              {result.error && <span className="ml-2 opacity-75">: {result.error}</span>}
            </div>

            {/* Tabs */}
            {tabs.length > 0 && (
              <div className="flex gap-1 border-b border-border">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Virality Tab */}
            {activeTab === "virality" && result.virality && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass rounded-xl border border-border p-6">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                      <div className={`text-5xl font-black ${viralColor(result.virality.viral_probability ?? 0)}`}>
                        {result.virality.viral_probability ?? 0}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Viral Probability</div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      {[
                        ["Hook", result.virality.hook_score],
                        ["Emotion", (result.virality as { emotion_score?: number }).emotion_score],
                        ["Curiosity", (result.virality as { curiosity_gap?: number }).curiosity_gap],
                        ["Replay", (result.virality as { replay_potential?: number }).replay_potential],
                        ["Sharing", (result.virality as { shareability?: number }).shareability],
                        ["Retention", result.virality.retention_prediction],
                      ].map(([label, val]) => (
                        <div key={label as string} className="glass rounded-lg p-2 text-center">
                          <div className="text-xs text-muted-foreground">{label}</div>
                          <div className="text-sm font-bold text-foreground mt-0.5">
                            {typeof val === "number" ? `${val}/10` : val ?? "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.virality.strengths && (
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                        {result.virality.strengths.map((s, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />{s}
                          </p>
                        ))}
                      </div>
                    )}
                    {result.virality.weaknesses && (
                      <div>
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2">Weaknesses</p>
                        {result.virality.weaknesses.map((w, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1.5">
                            <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />{w}
                          </p>
                        ))}
                      </div>
                    )}
                    {result.virality.recommendations && (
                      <div>
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Recommendations</p>
                        {result.virality.recommendations.map((r, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1.5">
                            <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />{r}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Hooks Tab */}
            {activeTab === "hooks" && result.hooks && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {result.hooks.topHook && (
                  <div className="glass rounded-xl border border-yellow-400/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Top Hook — {result.hooks.topHook.predicted_retention}/10 predicted retention</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">"{result.hooks.topHook.hook}"</p>
                    <span className="text-[10px] text-muted-foreground mt-1 inline-block">{result.hooks.topHook.style}</span>
                  </div>
                )}
                {result.hooks.hooks?.map((h, i) => (
                  <div key={i} className="glass rounded-lg border border-border p-3 flex items-start gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 pt-0.5">#{h.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">"{h.hook}"</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">{h.style}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{h.emotional_trigger}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold ${h.predicted_retention >= 8 ? "text-emerald-400" : h.predicted_retention >= 6 ? "text-yellow-400" : "text-muted-foreground"}`}>
                        {h.predicted_retention}/10
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Emotion Tab */}
            {activeTab === "emotion" && result.emotion && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass rounded-xl border border-pink-400/20 p-4 text-center">
                    <div className="text-3xl font-black text-pink-400">{result.emotion.bingeabilityScore ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Bingeability</div>
                  </div>
                  <div className="glass rounded-xl border border-purple-400/20 p-4 text-center">
                    <div className="text-3xl font-black text-purple-400">{result.emotion.replayScore ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Replay Score</div>
                  </div>
                  <div className="glass rounded-xl border border-amber-400/20 p-4 text-center">
                    <div className="text-3xl font-black text-amber-400">{result.emotion.dopamineSpikes?.length ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Dopamine Spikes</div>
                  </div>
                </div>
                {result.emotion.tensionPoints && result.emotion.tensionPoints.length > 0 && (
                  <div className="glass rounded-xl border border-border p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tension Points</p>
                    {result.emotion.tensionPoints.map((t, i) => (
                      <p key={i} className="text-sm text-foreground mb-2 flex items-start gap-2">
                        <Target className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" /> {t}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Visuals Tab */}
            {activeTab === "visuals" && result.visuals && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl border border-cyan-400/20 p-4">
                    <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">Overall Tone</p>
                    <p className="text-sm text-foreground">{result.visuals.overallTone}</p>
                  </div>
                  <div className="glass rounded-xl border border-cyan-400/20 p-4">
                    <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">Color Strategy</p>
                    <p className="text-sm text-foreground">{result.visuals.colorStrategy}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.visuals.storyboard?.slice(0, 6).map((scene, i) => (
                    <div key={i} className="glass rounded-lg border border-border p-3 flex gap-3">
                      <span className="text-xs font-bold text-primary w-6 shrink-0">S{i + 1}</span>
                      <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-1">
                        <p className="text-xs text-foreground col-span-2">{scene.scene}</p>
                        <p className="text-[10px] text-muted-foreground"><span className="text-cyan-400">Camera:</span> {scene.camera_motion}</p>
                        <p className="text-[10px] text-muted-foreground"><span className="text-pink-400">Emotion:</span> {scene.emotion}</p>
                        <p className="text-[10px] text-muted-foreground col-span-2"><span className="text-violet-400">Style:</span> {scene.visual_style}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Captions Tab */}
            {activeTab === "captions" && result.captions && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Recommended:</span>
                  <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">{result.captions.recommendedStyle}</span>
                </div>
                {result.captions.captionSets?.map((set, i) => (
                  <div key={i} className="glass rounded-xl border border-violet-400/20 p-4">
                    <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">{set.style.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground mb-3">{set.styleDescription}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(set as { captions?: Array<{ text: string; animation: string; color: string }> }).captions?.slice(0, 8).map((c, j) => (
                        <span key={j} className="text-[11px] px-2 py-1 rounded font-bold bg-muted/50 text-foreground border border-border">
                          {c.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && result.allLogs && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-xl border border-border p-4 font-mono space-y-1 max-h-80 overflow-y-auto">
                {result.allLogs.map((log, i) => (
                  <div key={i} className="text-[11px] flex gap-2">
                    <span className="text-primary shrink-0">[{log.agent}]</span>
                    <span className="text-muted-foreground">{log.message}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
