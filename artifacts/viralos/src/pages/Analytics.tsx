import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useGetDashboardStats,
  useGetPlatformBreakdown,
} from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  BarChart3, CheckCircle, TrendingUp, Clock, Video,
  Brain, Zap, Target, Activity, Flame, RefreshCw, Loader2
} from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  youtube_shorts: "YT Shorts",
  tiktok: "TikTok",
  reels: "Reels",
  x_clips: "X Clips",
  all: "All",
};

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#6b7280"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    fontSize: "11px",
  },
};

interface ViralityHistoryPoint {
  date: string;
  viral_probability: number;
  hook_score: number;
  emotion_score: number;
  retention_score: number;
  shareability: number;
}

interface EmotionPoint {
  date: string;
  bingeability: number;
  replay: number;
  dopamineSpikes: number;
}

interface AgentRunStats {
  total: number;
  completed: number;
  failed: number;
  byMode: Record<string, number>;
  recent: Array<{ id: number; mode: string; status: string; createdAt: string }>;
}

const viralColor = (v: number) => {
  if (v >= 75) return "#10b981";
  if (v >= 50) return "#f59e0b";
  return "#ef4444";
};

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: breakdown, isLoading: breakdownLoading } = useGetPlatformBreakdown();

  const [viralHistory, setViralHistory] = useState<ViralityHistoryPoint[]>([]);
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionPoint[]>([]);
  const [agentStats, setAgentStats] = useState<AgentRunStats | null>(null);
  const [loadingExtra, setLoadingExtra] = useState(true);

  const fetchExtra = async () => {
    setLoadingExtra(true);
    try {
      const [vhRes, etRes, arRes] = await Promise.all([
        fetch("/api/analytics/virality-history"),
        fetch("/api/analytics/emotion-timeline"),
        fetch("/api/analytics/agent-runs-stats"),
      ]);
      const [vh, et, ar] = await Promise.all([vhRes.json(), etRes.json(), arRes.json()]);
      setViralHistory(Array.isArray(vh) ? vh : []);
      setEmotionTimeline(Array.isArray(et) ? et : []);
      setAgentStats(ar);
    } catch {
    } finally {
      setLoadingExtra(false);
    }
  };

  useEffect(() => { fetchExtra(); }, []);

  const chartData = breakdown?.map((b, i) => ({
    name: PLATFORM_LABELS[b.platform] ?? b.platform,
    count: b.count,
    rate: b.successRate,
    fill: COLORS[i % COLORS.length],
  })) ?? [];

  const statCards = [
    { label: "Total Projects", value: stats?.totalProjects ?? 0, icon: Video, color: "text-primary", bg: "bg-primary/10" },
    { label: "Videos Done", value: stats?.videosGenerated ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "In Progress", value: stats?.inProgress ?? 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Success Rate", value: `${stats?.successRate ?? 0}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Agent Runs", value: agentStats?.total ?? 0, icon: Activity, color: "text-orange-400", bg: "bg-orange-400/10" },
    {
      label: "Total Content",
      value: stats?.totalDurationSec ? `${Math.round(stats.totalDurationSec / 60)}m` : "0m",
      icon: Video,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
  ];

  const radarData = viralHistory.length > 0
    ? [
        { metric: "Hook", value: Math.round(viralHistory.reduce((s, v) => s + v.hook_score, 0) / viralHistory.length * 10) },
        { metric: "Emotion", value: Math.round(viralHistory.reduce((s, v) => s + v.emotion_score, 0) / viralHistory.length * 10) },
        { metric: "Retention", value: Math.round(viralHistory.reduce((s, v) => s + v.retention_score, 0) / viralHistory.length) },
        { metric: "Viral", value: Math.round(viralHistory.reduce((s, v) => s + v.viral_probability, 0) / viralHistory.length) },
        { metric: "Share", value: Math.round(viralHistory.reduce((s, v) => s + v.shareability, 0) / viralHistory.length * 10) },
      ]
    : [
        { metric: "Hook", value: 0 },
        { metric: "Emotion", value: 0 },
        { metric: "Retention", value: 0 },
        { metric: "Viral", value: 0 },
        { metric: "Share", value: 0 },
      ];

  const avgViral = viralHistory.length > 0
    ? Math.round(viralHistory.reduce((s, v) => s + v.viral_probability, 0) / viralHistory.length)
    : 0;

  const byModeData = agentStats ? Object.entries(agentStats.byMode).map(([mode, count]) => ({ mode, count })) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Performance intelligence — viral scores, emotion graphs, trend heatmaps</p>
        </div>
        <button
          onClick={fetchExtra}
          disabled={loadingExtra}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loadingExtra ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={item}>
              <div className="glass rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
                    {statsLoading ? (
                      <div className="h-7 w-12 bg-muted rounded mt-1 animate-pulse" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Viral Score Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Viral Score Timeline
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {viralHistory.length > 0 ? `Avg ${avgViral}% viral probability across ${viralHistory.length} runs` : "Run agents to populate"}
            </p>
          </div>
          {avgViral > 0 && (
            <div className="text-right">
              <div className="text-2xl font-black" style={{ color: viralColor(avgViral) }}>{avgViral}%</div>
              <div className="text-xs text-muted-foreground">avg viral</div>
            </div>
          )}
        </div>
        {loadingExtra ? (
          <div className="h-48 bg-muted rounded animate-pulse" />
        ) : viralHistory.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No virality data yet</p>
              <p className="text-xs text-muted-foreground">Run agents on a project to see scores</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={viralHistory}>
              <defs>
                <linearGradient id="viralGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="viral_probability" stroke="#3b82f6" fill="url(#viralGrad)" strokeWidth={2} name="Viral %" dot={false} />
              <Area type="monotone" dataKey="retention_score" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Retention" dot={false} />
              <Line type="monotone" dataKey="hook_score" stroke="#f59e0b" strokeWidth={1.5} name="Hook /10" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotional Intensity Graph */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Brain className="w-4 h-4 text-pink-400" /> Emotional Intensity
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Bingeability, replay potential & dopamine spikes over time</p>
          {loadingExtra ? (
            <div className="h-48 bg-muted rounded animate-pulse" />
          ) : emotionTimeline.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No emotion data yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={emotionTimeline} barCategoryGap="25%">
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="bingeability" fill="#ec4899" radius={[3, 3, 0, 0]} name="Bingeability" />
                <Bar dataKey="replay" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Replay" />
                <Bar dataKey="dopamineSpikes" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Dopamine Spikes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Content Performance Radar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> Audience Psychology Profile
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Average performance across key viral dimensions</p>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform breakdown bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Projects by Platform</h2>
          {breakdownLoading ? (
            <div className="h-48 bg-muted rounded animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Agent run distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Agent Pipeline Distribution
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {agentStats ? `${agentStats.completed} completed · ${agentStats.failed} failed of ${agentStats.total} total runs` : "Loading..."}
          </p>
          {loadingExtra ? (
            <div className="h-48 bg-muted rounded animate-pulse" />
          ) : byModeData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No agent runs yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={byModeData} dataKey="count" nameKey="mode" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                  {byModeData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 10 }}>{value?.replace(/_/g, " ")}</span>}
                />
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Retention Prediction Table */}
      {viralHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Virality Score History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Viral %", "Hook", "Emotion", "Retention", "Share"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...viralHistory].reverse().slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{row.date}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold" style={{ color: viralColor(row.viral_probability) }}>{row.viral_probability}%</span>
                    </td>
                    <td className="px-5 py-3 text-foreground">{row.hook_score}/10</td>
                    <td className="px-5 py-3 text-foreground">{row.emotion_score}/10</td>
                    <td className="px-5 py-3 text-foreground">{row.retention_score}</td>
                    <td className="px-5 py-3 text-foreground">{row.shareability}/10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
