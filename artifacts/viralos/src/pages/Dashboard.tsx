import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Zap, Activity, TrendingUp, Brain, Upload, FlaskConical, DollarSign,
  Cpu, Globe, Database, Radio, ChevronRight, ArrowUpRight, Loader2,
  Play, BarChart3, Eye, Clock, Server, Shield,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const TICKER_ITEMS = [
  "HOOK_SCORE +2.3% · ", "VIRAL_PROB 87.4 · ", "RETENTION 71.2% · ", "AB_WIN confidence 94% · ",
  "CALENDAR 14 posts queued · ", "GPU_LOAD 68% · ", "CACHE_HIT 81% · ", "INSIGHTS 23 patterns active · ",
  "CHANNELS 3 live · ", "REVENUE_EST $4.2K/mo · ", "ENGAGEMENT +18% · ", "LOOP_ACTIVE ✓ · ",
];

function LiveTicker() {
  const [pos, setPos] = useState(0);
  const text = TICKER_ITEMS.join("");
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

const AGENT_NODES = [
  { id: "hook", label: "Hook Agent", status: "active", load: 82 },
  { id: "emotion", label: "Emotion AI", status: "active", load: 67 },
  { id: "virality", label: "Virality Scorer", status: "active", load: 91 },
  { id: "memory", label: "Memory Vault", status: "active", load: 44 },
  { id: "trend", label: "Trend Radar", status: "active", load: 55 },
  { id: "calendar", label: "Calendar AI", status: "active", load: 38 },
  { id: "publisher", label: "Publisher Bot", status: "active", load: 29 },
  { id: "optimizer", label: "Self-Optimizer", status: "active", load: 71 },
];

const QUICK_ACTIONS = [
  { label: "Create Video", icon: Play, href: "/create", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { label: "A/B Test", icon: FlaskConical, href: "/ab-testing", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  { label: "Build Brand", icon: Globe, href: "/brand", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { label: "Clone Style", icon: Brain, href: "/personality", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
  { label: "Schedule Post", icon: Upload, href: "/publisher", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
  { label: "Marketplace", icon: Database, href: "/marketplace", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
];

function usePulsingData(len: number, min: number, max: number) {
  const [data, setData] = useState(() =>
    Array.from({ length: len }, (_, i) => ({ t: i, v: Math.floor(min + Math.random() * (max - min)) }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => {
        const next = [...d.slice(1), { t: d[d.length - 1].t + 1, v: Math.floor(min + Math.random() * (max - min)) }];
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return data;
}

const RADAR_DATA = [
  { axis: "Hook Power", A: 87 },
  { axis: "Retention", A: 71 },
  { axis: "Emotion Score", A: 82 },
  { axis: "Virality", A: 94 },
  { axis: "Shareability", A: 68 },
  { axis: "Binge Score", A: 76 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const viralData = usePulsingData(30, 55, 98);
  const engageData = usePulsingData(30, 3, 18);

  useEffect(() => {
    fetch("/api/analytics/dashboard-stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  const totalVideos = stats ? Number(stats.totalVideos ?? 0) : 0;
  const completedVideos = stats ? Number(stats.completedVideos ?? 0) : 0;
  const totalViews = stats ? Number(stats.totalViews ?? 0) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080b0f]">
      {/* Top bar — Bloomberg-style */}
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
          <LiveTicker />
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

      {/* Main content — scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { label: "VIRAL PROB", value: "94.2%", delta: "+2.1%", color: "text-emerald-400" },
            { label: "RETENTION", value: "71.4%", delta: "+3.8%", color: "text-primary" },
            { label: "HOOK SCORE", value: "87/100", delta: "+5", color: "text-yellow-400" },
            { label: "VIDEOS", value: String(totalVideos), delta: `${completedVideos} done`, color: "text-violet-400" },
            { label: "PATTERNS", value: "23", delta: "+4 today", color: "text-cyan-400" },
            { label: "AB TESTS", value: "5", delta: "3 running", color: "text-pink-400" },
            { label: "CHANNELS", value: "3", delta: "all live", color: "text-amber-400" },
            { label: "LOOP", value: "ACTIVE", delta: "reinforcing", color: "text-emerald-400" },
          ].map(({ label, value, delta, color }) => (
            <div key={label} className="glass border border-white/5 rounded-xl p-3 text-center hover:border-white/10 transition-colors">
              <p className={`text-lg font-black font-mono ${color}`}>{value}</p>
              <p className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">{label}</p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">{delta}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-3">

          {/* Viral score live chart */}
          <div className="col-span-12 lg:col-span-5 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Viral Score · Live</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><Radio className="w-2.5 h-2.5" /> Streaming</span>
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
                <Tooltip contentStyle={{ background: "#0a0f16", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", fontSize: "10px", color: "#e2e8f0" }} />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#viral_grad)" name="Viral %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement live chart */}
          <div className="col-span-12 lg:col-span-4 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Engagement Rate</span>
              </div>
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
                <Tooltip contentStyle={{ background: "#0a0f16", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", fontSize: "10px", color: "#e2e8f0" }} />
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#engage_grad)" name="Engage %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar */}
          <div className="col-span-12 lg:col-span-3 glass rounded-xl border border-white/5 p-4">
            <p className="text-[10px] font-bold text-foreground tracking-widest uppercase mb-2">Content Genome</p>
            <ResponsiveContainer width="100%" height={140}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 8 }} />
                <Radar dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent Network */}
          <div className="col-span-12 lg:col-span-4 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Agent Network</span>
            </div>
            <div className="space-y-2">
              {AGENT_NODES.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[10px] text-muted-foreground flex-1 truncate">{agent.label}</span>
                  <div className="w-20 h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${agent.load}%` }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className={`h-full rounded-full ${agent.load > 80 ? "bg-red-400" : agent.load > 60 ? "bg-yellow-400" : "bg-emerald-400"}`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-7 text-right">{agent.load}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-span-12 lg:col-span-4 glass rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Quick Launch</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(({ label, icon: Icon, href, color, bg, border }) => (
                <Link key={href} href={href}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 p-3 rounded-xl border ${border} ${bg} cursor-pointer transition-all hover:opacity-90`}>
                    <Icon className={`w-4 h-4 ${color} shrink-0`} />
                    <span className={`text-xs font-semibold ${color}`}>{label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Reinforcement loop status */}
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
                { step: "GENERATE", status: "complete", color: "text-primary" },
                { step: "UPLOAD", status: "complete", color: "text-emerald-400" },
                { step: "ANALYZE", status: "complete", color: "text-yellow-400" },
                { step: "LEARN", status: "active", color: "text-cyan-400" },
                { step: "IMPROVE", status: "queued", color: "text-muted-foreground" },
                { step: "REGENERATE", status: "queued", color: "text-muted-foreground" },
              ].map(({ step, status, color }, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${status === "complete" ? "border-emerald-400/40 bg-emerald-400/10" : status === "active" ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10"}`}>
                    {status === "complete" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className={`text-[9px] font-bold tracking-widest ${color}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live intelligence feed */}
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
