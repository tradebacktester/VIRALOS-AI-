import { motion } from "framer-motion";
import { useGetDashboardStats, useGetRecentProjects, useGetPlatformBreakdown } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Video, CheckCircle, Clock, TrendingUp, Plus, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted-foreground/40",
  scripting: "bg-blue-500",
  voicing: "bg-purple-500",
  finding_clips: "bg-yellow-500",
  editing: "bg-orange-500",
  rendering: "bg-cyan-500",
  done: "bg-emerald-500",
  failed: "bg-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  scripting: "Scripting",
  voicing: "Voicing",
  finding_clips: "Finding Clips",
  editing: "Editing",
  rendering: "Rendering",
  done: "Done",
  failed: "Failed",
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube_shorts: "YT Shorts",
  tiktok: "TikTok",
  reels: "Reels",
  x_clips: "X Clips",
  all: "All",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recent, isLoading: recentLoading } = useGetRecentProjects();
  const { data: breakdown } = useGetPlatformBreakdown();

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: Video,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Videos Generated",
      value: stats?.videosGenerated ?? 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Success Rate",
      value: `${stats?.successRate ?? 0}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  const chartData = breakdown?.map((b) => ({
    name: PLATFORM_LABELS[b.platform] ?? b.platform,
    count: b.count,
    rate: b.successRate,
  })) ?? [];

  const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#6b7280"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your viral content command center</p>
        </div>
        <Link href="/create">
          <Button data-testid="button-new-project" className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={item}>
              <div className="glass rounded-xl p-4 border border-border hover:border-primary/30 transition-colors" data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-xl border border-border p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Platform Breakdown</h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No data yet — create your first project</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
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
                  {chartData.map((_entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Export ready */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl border border-border p-5 flex flex-col"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Exports Ready</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold gradient-text">{stats?.exportsReady ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-2">platform-ready files</p>
              <p className="text-xs text-muted-foreground">{stats?.totalDurationSec ? `${Math.round(stats.totalDurationSec / 60)}m total content` : "—"}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent projects */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl border border-border"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Projects</h2>
          <Link href="/projects">
            <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
          </Link>
        </div>
        {recentLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !recent || recent.length === 0 ? (
          <div className="p-10 text-center">
            <Video className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <Link href="/create">
              <Button variant="outline" size="sm" className="mt-3 gap-2">
                <Plus className="w-3.5 h-3.5" />
                Create your first video
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.slice(0, 6).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/30 cursor-pointer transition-colors"
                  data-testid={`row-project-${project.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {project.thumbnailUrl ? (
                      <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Video className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{PLATFORM_LABELS[project.platform]}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[project.status] ?? "bg-muted-foreground"} ${project.status === "rendering" ? "pulse-dot" : ""}`} />
                      <span className="text-xs text-muted-foreground">{STATUS_LABELS[project.status]}</span>
                    </div>
                    {project.status !== "pending" && project.status !== "done" && project.status !== "failed" && (
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
