import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, ChevronRight, Calendar, Target, Sparkles, TrendingUp, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StrategyResult {
  data?: {
    contentPillars?: Array<{ name: string; description: string; content_types: string[]; posting_frequency: string }>;
    postingSchedule?: Array<{ day: string; time: string; platform: string; content_type: string }>;
    hookStrategies?: string[];
    emotionalPositioning?: string;
    nicheAnalysis?: string;
    dominationPlan?: string;
    keyMessages?: string[];
    competitiveEdge?: string;
  };
  success?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "bg-pink-400/10 text-pink-400 border-pink-400/20",
  youtube_shorts: "bg-red-400/10 text-red-400 border-red-400/20",
  instagram: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  x: "bg-sky-400/10 text-sky-400 border-sky-400/20",
};

const EXAMPLE_NICHES = [
  "Dark motivation", "Finance & wealth", "Fitness transformation",
  "Tech reviews", "True crime", "Self improvement",
  "Luxury lifestyle", "Anime edits", "Stoicism",
];

export default function StrategyPage() {
  const { toast } = useToast();
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["tiktok", "youtube_shorts"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyResult | null>(null);
  const [tab, setTab] = useState<"pillars" | "schedule" | "hooks" | "plan">("pillars");

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const generate = async () => {
    if (!niche.trim() || !goal.trim()) {
      toast({ title: "Enter your niche and goal", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/agents/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, goal, platforms }),
      });
      const data = await res.json() as StrategyResult;
      setResult(data);
      toast({ title: "Strategy generated!", description: `${data.data?.contentPillars?.length ?? 0} content pillars created` });
    } catch {
      toast({ title: "Strategy generation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> Content Strategy Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Type your niche — AI builds your complete niche domination plan</p>
      </div>

      {/* Input panel */}
      <div className="glass rounded-xl border border-border p-5 space-y-4">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Your Niche</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {EXAMPLE_NICHES.map((n) => (
              <button key={n} onClick={() => setNiche(n)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${niche === n ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"}`}>
                {n}
              </button>
            ))}
          </div>
          <input value={niche} onChange={(e) => setNiche(e.target.value)}
            placeholder="Or type your own niche..."
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Your Goal</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Grow a dark motivation page to 100k followers in 90 days"
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {["tiktok", "youtube_shorts", "instagram", "x"].map((p) => (
              <button key={p} onClick={() => togglePlatform(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${platforms.includes(p) ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/20"}`}>
                {p === "youtube_shorts" ? "YT Shorts" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading || !niche.trim() || !goal.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 glow-blue">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Building Strategy...</> : <><Sparkles className="w-4 h-4" /> Generate Strategy</>}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result?.data && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Positioning + Edge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-xl border border-primary/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Emotional Positioning</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{result.data.emotionalPositioning}</p>
              </div>
              <div className="glass rounded-xl border border-emerald-400/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Competitive Edge</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{result.data.competitiveEdge}</p>
              </div>
            </div>

            {/* Key Messages */}
            {result.data.keyMessages && (
              <div className="glass rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Core Brand Messages</p>
                <div className="flex flex-wrap gap-2">
                  {result.data.keyMessages.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border text-foreground">
                      "{m}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {([
                ["pillars", "Content Pillars", BookOpen],
                ["schedule", "Posting Schedule", Calendar],
                ["hooks", "Hook Strategies", Sparkles],
                ["plan", "Domination Plan", Brain],
              ] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {/* Content Pillars */}
            {tab === "pillars" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.data.contentPillars?.map((pillar, i) => (
                  <div key={i} className="glass rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-foreground">{pillar.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{pillar.posting_frequency}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{pillar.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {pillar.content_types.map((ct, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border text-muted-foreground">{ct}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Posting Schedule */}
            {tab === "schedule" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {result.data.postingSchedule?.map((slot, i) => (
                  <div key={i} className="glass rounded-lg border border-border p-3 flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground w-24 shrink-0">{slot.day}</span>
                    <span className="text-sm text-primary font-mono w-20 shrink-0">{slot.time}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${PLATFORM_COLORS[slot.platform] ?? "bg-muted/50 text-muted-foreground border-border"}`}>
                      {slot.platform === "youtube_shorts" ? "YT Shorts" : slot.platform}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1">{slot.content_type}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Hook Strategies */}
            {tab === "hooks" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {result.data.hookStrategies?.map((hook, i) => (
                  <div key={i} className="glass rounded-lg border border-yellow-400/20 p-3 flex items-start gap-3">
                    <span className="text-xs font-bold text-yellow-400 w-5 shrink-0">#{i + 1}</span>
                    <p className="text-sm text-foreground">{hook}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Domination Plan */}
            {tab === "plan" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-xl border border-primary/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-primary">90-Day Niche Domination Plan</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{result.data.dominationPlan}</p>
              </motion.div>
            )}

            {/* Niche Analysis */}
            {result.data.nicheAnalysis && (
              <div className="glass rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Niche Analysis</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.data.nicheAnalysis}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
