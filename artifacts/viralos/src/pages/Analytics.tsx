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
} from "recharts";
import { BarChart3, CheckCircle, TrendingUp, Clock, Video } from "lucide-react";

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

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: breakdown, isLoading: breakdownLoading } = useGetPlatformBreakdown();

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
    { label: "Exports Ready", value: stats?.exportsReady ?? 0, icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    {
      label: "Total Content",
      value: stats?.totalDurationSec ? `${Math.round(stats.totalDurationSec / 60)}m` : "0m",
      icon: Video,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Performance overview across all projects</p>
      </div>

      {/* Stats grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={item}>
              <div className="glass rounded-xl border border-border p-4" data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl border border-border p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Projects by Platform</h2>
          {breakdownLoading ? (
            <div className="h-48 bg-muted rounded animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl border border-border p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Success Rate by Platform</h2>
          {breakdownLoading ? (
            <div className="h-48 bg-muted rounded animate-pulse" />
          ) : chartData.length === 0 || chartData.every((d) => d.count === 0) ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData.filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {chartData.filter((d) => d.count > 0).map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
