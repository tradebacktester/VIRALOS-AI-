import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListTrends } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Loader2, Zap } from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  youtube_shorts: "YT Shorts",
  tiktok: "TikTok",
  reels: "Reels",
  x_clips: "X Clips",
  all: "All",
};

const SCORE_COLORS = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-muted-foreground";
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Trends() {
  const [platformFilter, setPlatformFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: trends, isLoading } = useListTrends({
    platform: platformFilter || undefined,
    category: categoryFilter || undefined,
  });

  const categories = [...new Set(trends?.map((t) => t.category) ?? [])];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trend Radar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Viral topics ranked by momentum score</p>
        </div>
        <Link href="/create">
          <Button data-testid="button-create-from-trend" className="gap-2">
            <Plus className="w-4 h-4" />
            Create From Trend
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          data-testid="select-platform-filter"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Platforms</option>
          {Object.entries(PLATFORM_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          data-testid="select-category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-14 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !trends || trends.length === 0 ? (
        <div className="glass rounded-xl border border-border p-16 text-center">
          <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No trends found</p>
          <p className="text-xs text-muted-foreground mt-1">Trends are seeded with sample data on first run</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          {trends.map((trend, index) => (
            <motion.div key={trend.id} variants={item}>
              <div
                className="glass rounded-xl border border-border hover:border-primary/30 transition-colors flex items-center gap-4 px-4 py-3.5 cursor-pointer group"
                data-testid={`card-trend-${trend.id}`}
              >
                <div className="w-7 text-center">
                  <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {trend.emoji && <span className="text-base">{trend.emoji}</span>}
                    <p className="text-sm font-semibold text-foreground truncate">{trend.topic}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{trend.category}</span>
                    <span className="text-[10px] text-muted-foreground">{PLATFORM_LABELS[trend.platform] ?? trend.platform}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${SCORE_COLORS(trend.score)}`}>{trend.score}</p>
                    <p className="text-[10px] text-muted-foreground">score</p>
                  </div>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${trend.score}%` }}
                    />
                  </div>
                  <Link href={`/create`}>
                    <button
                      data-testid={`button-use-trend-${trend.id}`}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/15"
                    >
                      <Zap className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
