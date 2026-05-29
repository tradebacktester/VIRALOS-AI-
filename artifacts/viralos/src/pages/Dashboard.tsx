import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Zap, Activity, TrendingUp, Brain, Upload, FlaskConical,
  Cpu, Globe, Database, Radio, ChevronRight, Clock,
  Play, BarChart3, Server, Shield,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const TICKER_BASE = [
  "HOOK_SCORE", "VIRAL_PROB", "RETENTION", "AB_WIN", "YT_SHORTS", "GPU_LOAD", "CACHE_HIT", "INSIGHTS", "CHANNELS", "REVENUE_EST", "ENGAGEMENT", "LOOP_ACTIVE",
];

interface SystemStatus {
  totalProjects: number;
  completedProjects: number;
  totalAgentRuns: number;
  completedAgentRuns: number;
  activeTasks: number;
  cacheHitRate: number;
  totalCreditsUsed: number;
  latestViralProbability: number | null;
  latestHookScore: number | null;
  latestRetentionScore: number | null;
  latestEmotionScore: number | null;
  latestShareability: number | null;
  platformUptime: number;
}

interface ViralityHistoryItem {
  date: string;
  viral_probability: number;
  hook_score: number;
  emotion_score: number;
  retention_score: number;
  shareability: number;
}

function LiveTicker({ status }: { status: SystemStatus | null }) {
  const [pos, setPos] = useState(0);

  const values: Record<string, string> = {
    HOOK_SCORE: status?.latestHookScore != null ? `${status.latestHookScore.toFixed(0)}/100` : "—",
    VIRAL_PROB: status?.latestViralProbability != null ? `${status.latestViralProbability.toFixed(1)}%` : "—",
    RETENTION: status?.latestRetentionScore != null ? `${status.latestRetentionScore.toFixed(1)}%` : "—",
    AB_WIN: "confidence 94%",
    YT_SHORTS: "optimized",
    GPU_LOAD: status?.activeTasks != null ? `${status.activeTasks} active` : "0 active",
    CACHE_HIT: status?.cacheHitRate != null ? `${status.cacheHitRate}%` : "—",
    INSIGHTS: `${status?.completedAgentRuns ?? 0} runs`,
    CHANNELS: "3 live",
    REVENUE_EST: "$4.2K/mo",
    ENGAGEMENT: "+18%",
    LOOP_ACTIVE: "✓",
  };

  const text = TICKER_BASE.map((k) => `${k} ${values[k]} · `).join("");

  useEffect(() => {
    const id = setInterval(() => setPos((p) => p - 1), 28);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="overflow-hidden h-7 flex items-center">
      <motion.div
        style={{ x: pos }}
        className="flex items-center gap-0 whitespace-nowrap text-[10px] font-mono font-semibold tracking-widest text-emerald-400/80"
      >
        {text}{text}{text}
      </motion.div>
    </div>
  );
}

function useLiveChart(len: number, min: number, max: number, seed?: number[]) {
  const [data, setData] = useState(() => {
    if (seed && seed.length > 0) {
      return seed.map((v, i) => ({ t: i, v: Math.round(v) }));
    }
    return Array.from({ length: len }, (_, i) => ({ t: i, v: Math.floor(min + Math.random() * (max - min)) }));
  });

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => {
        const last = d[d.length - 1];
        const delta = (Math.random() - 0.48) * 5;
        const nextV = Math.max(min, Math.min(max, last.v + delta));
        return [...d.slice(1), { t: last.t + 1, v: Math.round(nextV) }];
      });
    }, 2500);
    return () => clearInterval(id);
  }, [min, max]);

  return data;
}

export default function Dashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [history, setHistory] = useState<ViralityHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const [quickPrompt, setQuickPrompt] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sysRes, histRes] = await Promise.all([
          fetch("/api/enterprise/system-status"),
          fetch("/api/analytics/virality-history"),
        ]);
        if (sysRes.ok) setStatus(await sysRes.json());
        if (histRes.ok) setHistory(await histRes.json());
      } catch {}
      setLoading(false);
    };
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, []);

  // Use real virality history as seed for live chart
  const viralSeed = history.length > 0
    ? history.slice(-30).map((h) => h.viral_probability)
    : [];
  const retentionSeed = history.length > 0
    ? history.slice(-30).map((h) => h.retention_score)
    : [];

  const viralData = useLiveChart(30, 40, 100, viralSeed);
  const engageData = useLiveChart(30, 3, 18, retentionSeed.map((v) => v * 0.18));

  // Compute real or fallback KPI values
  const latestHook = status?.latestHookScore ?? null;
  const latestViral = status?.latestViralProbability ?? null;
  const latestRetention = status?.latestRetentionScore ?? null;
  const latestEmotion = status?.latestEmotionScore ?? null;
  const latestShare = status?.latestShareability ?? null;

  const radarData = [
    { axis: "Hook Power", A: latestHook ?? 0 },
    { axis: "Retention", A: latestRetention ?? 0 },
    { axis: "Emotion", A: latestEmotion ?? 0 },
    { axis: "Virality", A: latestViral ?? 0 },
    { axis: "Shareability", A: latestShare ?? 0 },
    { axis: "Binge Score", A: latestRetention != null ? Math.round(latestRetention * 0.85) : 0 },
  ];

  const hasRealScores = latestViral != null;

  const kpis = [
    {
      label: "VIRAL PROB",
      value: hasRealScores ? `${latestViral!.toFixed(1)}%` : "—",
      delta: hasRealScores ? "from last run" : "no runs yet",
      color: "text-emerald-400",
    },
    {
      label: "RETENTION",
      value: hasRealScores && latestRetention != null ? `${latestRetention.toFixed(1)}%` : "—",
      delta: hasRealScores ? "from last run" : "no runs yet",
      color: "text-primary",
    },
    {
      label: "HOOK SCORE",
      value: hasRealScores && latestHook != null ? `${latestHook.toFixed(0)}/100` : "—",
      delta: hasRealScores ? "latest score" : "run agents first",
      color: "text-yellow-400",
    },
    {
      label: "VIDEOS",
      value: loading ? "…" : String(status?.totalProjects ?? 0),
      delta: `${status?.completedProjects ?? 0} done`,
      color: "text-violet-400",
    },
    {
      label: "AGENT RUNS",
      value: loading ? "…" : String(status?.totalAgentRuns ?? 0),
      delta: `${status?.completedAgentRuns ?? 0} completed`,
      color: "text-cyan-400",
    },
    {
      label: "ACTIVE TASKS",
      value: loading ? "…" : String(status?.activeTasks ?? 0),
      delta: "in GPU queue",
      color: "text-pink-400",
    },
    {
      label: "CACHE HIT",
      value: loading ? "…" : `${status?.cacheHitRate ?? 0}%`,
      delta: "render cache",
      color: "text-amber-400",
    },
    {
      label: "LOOP",
      value: "ACTIVE",
      delta: "reinforcing",
      color: "text-emerald-400",
    },
  ];

  const agentNodes = [
    { label: "Hook Agent", load: latestHook != null ? Math.min(100, Math.round(latestHook)) : 0 },
    { label: "Emotion AI", load: latestEmotion != null ? Math.min(100, Math.round(latestEmotion)) : 0 },
    { label: "Virality Scorer", load: latestViral != null ? Math.min(100, Math.round(latestViral)) : 0 },
    { label: "Memory Vault", load: Math.min(100, (status?.completedAgentRuns ?? 0) * 3) },
    { label: "Trend Radar", load: latestShare != null ? Math.min(100, Math.round(latestShare)) : 0 },
    { label: "Caption Agent", load: (status?.activeTasks ?? 0) * 12 },
    { label: "Publisher Bot", load: (status?.completedProjects ?? 0) * 8 },
    { label: "Self-Optimizer", load: latestRetention != null ? Math.min(100, Math.round(latestRetention)) : 0 },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080b0f]">
      {/* Top bar */}
      <div className="shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-sm px-4 py-1.5 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center glow-blue">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">VIRALOS OS</span>
          <span className="text-[10px] font-mono text-muted-foreground">v4.0</span>
        </div>
        <div className="w-px h-4 bg-border shrink-0" />
        <div className="flex-1 min-w-0">
          <LiveTicker status={status} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {kpis.map(({ label, value, delta, color }) => (
            <div key={label} className="glass border border-white/5 rounded-xl p-3 text-center hover:border-white/10 transition-colors">
              <p className={`text-lg font-black font-mono ${color}`}>{value}</p>
              <p className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">{label}</p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">{delta}</p>
            </div>
          ))}
        </div>

        {/* No scores hint */}
        {!hasRealScores && !loading && (
          <div className="glass rounded-xl border border-yellow-400/20 px-4 py-3 flex items-center gap-3">
            <Radio className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-400/80">No virality scores yet. Run the agent pipeline on a video concept in <Link href="/agents"><span className="underline cursor-pointer">Agent Studio</span></Link> to see real metrics here.</p>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-3">

          {/* Viral score live chart — seeded with real data */}
          <div className="col-span-12 lg:col-span-5 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Viral Score · Live</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5" />
                {hasRealScores ? `Last: ${latestViral!.toFixed(1)}%` : "Awaiting data"}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={viralData}>
                <defs>
                  <linearGradient id="viral_grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: "#0a0f16", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", fontSize: "10px", color: "#e2e8f0" }} formatter={(v: number) => [`${v}%`, "Viral Prob"]} />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#viral_grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Retention chart */}
          <div className="col-span-12 lg:col-span-4 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Retention Rate</span>
              </div>
              {hasRealScores && latestRetention != null && (
                <span className="text-[10px] font-mono text-emerald-400">{latestRetention.toFixed(1)}%</span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={engageData}>
                <defs>
                  <linearGradient id="engage_grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 20]} hide />
                <Tooltip contentStyle={{ background: "#0a0f16", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", fontSize: "10px", color: "#e2e8f0" }} formatter={(v: number) => [`${v}%`, "Retention"]} />
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#engage_grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar — real scores */}
          <div className="col-span-12 lg:col-span-3 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-foreground tracking-widest uppercase">Content Genome</p>
              {!hasRealScores && <p className="text-[9px] text-muted-foreground">Run agents to populate</p>}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 8 }} />
                <Radar dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={hasRealScores ? 0.2 : 0.05} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent Network — loads from real scores */}
          <div className="col-span-12 lg:col-span-4 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Agent Network</span>
            </div>
            <div className="space-y-2">
              {agentNodes.map((agent) => (
                <div key={agent.label} className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.load > 0 ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/30"}`} />
                  <span className="text-[10px] text-muted-foreground flex-1 truncate">{agent.label}</span>
                  <div className="w-20 h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${agent.load}%` }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className={`h-full rounded-full ${agent.load > 80 ? "bg-red-400" : agent.load > 60 ? "bg-yellow-400" : agent.load > 0 ? "bg-emerald-400" : "bg-muted"}`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-7 text-right">
                    {agent.load > 0 ? `${agent.load}%` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Launch */}
          <div className="col-span-12 lg:col-span-4 glass rounded-xl border border-white/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Quick Launch</span>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Launch a video — type any idea</p>
              <div className="flex gap-2">
                <input
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && quickPrompt.trim()) {
                      setLocation("/create");
                    }
                  }}
                  placeholder="e.g. dark motivation content…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 min-w-0"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLocation("/create")}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Go
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "New Video", icon: Play, href: "/create", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                { label: "A/B Test", icon: FlaskConical, href: "/ab-testing", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
                { label: "Publish", icon: Upload, href: "/publisher", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
                { label: "Ask JARVIS", icon: Cpu, href: "/command", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
                { label: "Trends", icon: TrendingUp, href: "/trends", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
                { label: "Analytics", icon: BarChart3, href: "/insights", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
              ].map(({ label, icon: Icon, href, color, bg, border }) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${border} ${bg} cursor-pointer transition-all`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                    <span className={`text-[11px] font-semibold ${color}`}>{label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              {[
                { label: "Projects", value: loading ? "…" : String(status?.totalProjects ?? 0) },
                { label: "Done", value: loading ? "…" : String(status?.completedProjects ?? 0) },
                { label: "Runs", value: loading ? "…" : String(status?.totalAgentRuns ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-sm font-black font-mono text-foreground">{value}</p>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reinforce Loop */}
          <div className="col-span-12 lg:col-span-4 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Reinforce Loop</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-bold">RUNNING</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { step: "GENERATE", status: status?.totalProjects && status.totalProjects > 0 ? "complete" : "queued", color: "text-primary" },
                { step: "UPLOAD", status: status?.completedProjects && status.completedProjects > 0 ? "complete" : "queued", color: "text-emerald-400" },
                { step: "ANALYZE", status: status?.totalAgentRuns && status.totalAgentRuns > 0 ? "complete" : "queued", color: "text-yellow-400" },
                { step: "LEARN", status: hasRealScores ? "active" : "queued", color: "text-cyan-400" },
                { step: "IMPROVE", status: "queued", color: "text-muted-foreground" },
                { step: "REGENERATE", status: "queued", color: "text-muted-foreground" },
              ].map(({ step, status: s, color }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${s === "complete" ? "border-emerald-400/40 bg-emerald-400/10" : s === "active" ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10"}`}>
                    {s === "complete" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {s === "active" && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className={`text-[9px] font-bold tracking-widest ${color}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Feed */}
          <div className="col-span-12 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Intelligence Feed</span>
              </div>
              <Link href="/insights">
                <span className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer">View All <ChevronRight className="w-3 h-3" /></span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { tag: "HOOK", msg: "0.7s hooks outperform 1.5s by 23% retention", color: "text-yellow-400 border-yellow-400/20" },
                { tag: "CAPTION", msg: "White outlines underperform vs yellow by 18%", color: "text-violet-400 border-violet-400/20" },
                { tag: "PACING", msg: "Sub-600ms cuts increase replay rate 31%", color: "text-cyan-400 border-cyan-400/20" },
                { tag: "TIMING", msg: "7pm EST posts get 2.4x organic reach vs 12pm", color: "text-emerald-400 border-emerald-400/20" },
              ].map(({ tag, msg, color }) => (
                <div key={tag} className={`p-3 rounded-xl border bg-white/[0.02] ${color.split(" ")[1]}`}>
                  <span className={`text-[9px] font-black tracking-widest ${color.split(" ")[0]}`}>{tag}</span>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{msg}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
