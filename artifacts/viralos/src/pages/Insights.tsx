import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, RefreshCw, Loader2, Zap, TrendingUp, Play, CheckCircle,
  Activity, MessageSquare, ChevronRight, Lightbulb, Target, X, Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

interface LearningInsight {
  id: number;
  category: string;
  insight: string;
  pattern?: string;
  impactMetric?: string;
  impactValue?: number;
  confidence?: number;
  sampleSize?: number;
  isActive: boolean;
  appliedCount?: number;
  avgImprovementPct?: number;
  createdAt: string;
}

interface CommentInsight {
  id: number;
  projectId?: number;
  platform: string;
  totalComments: number;
  dominantEmotion?: string;
  topRequests?: string[];
  painPoints?: string[];
  audienceDesires?: string[];
  sentimentScore?: number;
  actionableTakeaways?: string[];
  createdAt: string;
}

const CATEGORY_META: Record<string, { color: string; bg: string; border: string; label: string }> = {
  retention: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Retention" },
  hook: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Hook" },
  caption: { color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", label: "Caption" },
  pacing: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", label: "Pacing" },
  visual: { color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", label: "Visual" },
  audio: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Audio" },
  emotion: { color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20", label: "Emotion" },
  posting_time: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "Timing" },
};

const impactColor = (val: number) => val >= 15 ? "text-emerald-400" : val >= 8 ? "text-yellow-400" : "text-muted-foreground";

export default function Insights() {
  const { toast } = useToast();
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [commentInsights, setCommentInsights] = useState<CommentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"learned" | "comments">("learned");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState({ platform: "tiktok", rawComments: "" });
  const [analyzingComments, setAnalyzingComments] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [insRes, comRes] = await Promise.all([
        fetch("/api/insights"),
        fetch("/api/insights/comments"),
      ]);
      const [ins, com] = await Promise.all([insRes.json(), comRes.json()]);
      setInsights(Array.isArray(ins) ? ins : []);
      setCommentInsights(Array.isArray(com) ? com : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const runOptimizer = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/insights/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      const count = data.data?.insights?.length ?? 0;
      toast({ title: `Self-optimization complete — ${count} new insights learned` });
      fetchAll();
    } catch { toast({ title: "Optimization failed", variant: "destructive" }); }
    finally { setRunning(false); }
  };

  const analyzeComments = async () => {
    setAnalyzingComments(true);
    try {
      const lines = commentForm.rawComments.split("\n").filter((l) => l.trim());
      const comments = lines.map((text) => ({ text: text.trim() }));
      const res = await fetch("/api/insights/comments/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments, platform: commentForm.platform }),
      });
      const data = await res.json();
      toast({ title: `Comment analysis complete — ${data.data?.dominantEmotion} audience detected` });
      setShowCommentForm(false);
      setCommentForm({ platform: "tiktok", rawComments: "" });
      fetchAll();
    } catch { toast({ title: "Analysis failed", variant: "destructive" }); }
    finally { setAnalyzingComments(false); }
  };

  const toggleInsight = async (id: number, isActive: boolean) => {
    await fetch(`/api/insights/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setInsights((p) => p.map((i) => i.id === id ? { ...i, isActive } : i));
  };

  const categories = Array.from(new Set(insights.map((i) => i.category)));
  const filtered = filterCategory ? insights.filter((i) => i.category === filterCategory) : insights;

  const topInsights = [...insights].sort((a, b) => (b.impactValue ?? 0) - (a.impactValue ?? 0)).slice(0, 3);
  const avgImpact = insights.length > 0 ? Math.round(insights.reduce((s, i) => s + (i.impactValue ?? 0), 0) / insights.length * 10) / 10 : 0;
  const activeCount = insights.filter((i) => i.isActive).length;

  const radialData = [{ value: Math.round((activeCount / Math.max(insights.length, 1)) * 100), fill: "#3b82f6" }];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-pink-400" /> Self-Learning System
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reinforcement loop — every video teaches VIRALOS how to perform better</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          <button onClick={runOptimizer} disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-400/10 border border-pink-400/20 text-pink-400 text-sm font-semibold hover:bg-pink-400/20 transition-colors disabled:opacity-50">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {running ? "Learning..." : "Run Optimizer"}
          </button>
        </div>
      </div>

      {/* Loop visualization */}
      <div className="glass rounded-xl border border-border p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Reinforcement Loop</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: "Generate", icon: Zap, color: "text-primary bg-primary/10 border-primary/20" },
            { label: "Upload", icon: Activity, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
            { label: "Analyze", icon: Target, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
            { label: "Learn", icon: Brain, color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
            { label: "Improve", icon: TrendingUp, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
            { label: "Regenerate", icon: RefreshCw, color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
          ].map(({ label, icon: Icon, color }, i, arr) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${color}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </div>
              {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Patterns Learned", value: insights.length, color: "text-pink-400", border: "border-pink-400/20" },
          { label: "Actively Applied", value: activeCount, color: "text-emerald-400", border: "border-emerald-400/20" },
          { label: "Avg Impact", value: `+${avgImpact}%`, color: "text-primary", border: "border-primary/20" },
          { label: "Comment Reports", value: commentInsights.length, color: "text-violet-400", border: "border-violet-400/20" },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`glass rounded-xl border ${border} p-4 text-center`}>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {topInsights.length > 0 && (
        <div className="glass rounded-xl border border-amber-400/20 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Top Insights by Impact
          </h2>
          <div className="space-y-2">
            {topInsights.map((ins, i) => {
              const meta = CATEGORY_META[ins.category] ?? CATEGORY_META.retention;
              return (
                <div key={ins.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <span className="text-sm font-black text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${meta.bg} ${meta.color} shrink-0`}>{meta.label}</span>
                  <p className="text-xs text-foreground flex-1 min-w-0 truncate">{ins.insight}</p>
                  <span className={`text-sm font-bold shrink-0 ${impactColor(ins.impactValue ?? 0)}`}>+{ins.impactValue}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-1 border-b border-border">
        {[{ id: "learned", label: "Learned Patterns", icon: Brain }, { id: "comments", label: "Comment Intelligence", icon: MessageSquare }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {tab === "learned" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterCategory(null)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filterCategory ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              All ({insights.length})
            </button>
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat] ?? CATEGORY_META.retention;
              const count = insights.filter((i) => i.category === cat).length;
              return (
                <button key={cat} onClick={() => setFilterCategory(cat === filterCategory ? null : cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterCategory === cat ? `${meta.bg} ${meta.border} ${meta.color}` : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            [1,2,3].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center glass rounded-xl border border-border">
              <Brain className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No patterns learned yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Run Optimizer" to start the self-learning loop</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((ins) => {
                const meta = CATEGORY_META[ins.category] ?? CATEGORY_META.retention;
                return (
                  <motion.div key={ins.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className={`glass rounded-xl border p-4 transition-all ${ins.isActive ? "border-border" : "border-border opacity-50"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 mt-0.5 ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{ins.insight}</p>
                        {ins.pattern && <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{ins.pattern}</p>}
                        <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
                          {ins.impactValue != null && <span>Impact: <span className={impactColor(ins.impactValue)}>+{ins.impactValue}% {ins.impactMetric}</span></span>}
                          {ins.confidence != null && <span>Confidence: <span className="text-foreground">{Math.round(ins.confidence * 100)}%</span></span>}
                          {ins.appliedCount != null && ins.appliedCount > 0 && <span>Applied: <span className="text-foreground">{ins.appliedCount}x</span></span>}
                        </div>
                      </div>
                      <button onClick={() => toggleInsight(ins.id, !ins.isActive)}
                        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${ins.isActive ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "comments" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCommentForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Analyze Comments
            </button>
          </div>

          <AnimatePresence>
            {showCommentForm && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass rounded-xl border border-primary/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Analyze Audience Comments</h3>
                  <button onClick={() => setShowCommentForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
                  <select value={commentForm.platform} onChange={(e) => setCommentForm((p) => ({ ...p, platform: e.target.value }))}
                    className="w-48 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                    {["tiktok","youtube","instagram","twitter"].map((pl) => <option key={pl} value={pl}>{pl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Paste Comments (one per line)</label>
                  <textarea value={commentForm.rawComments} onChange={(e) => setCommentForm((p) => ({ ...p, rawComments: e.target.value }))}
                    placeholder={"This changed my life\nI needed this today\nPart 2 please!\nHow do I start?"}
                    rows={5} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
                  <p className="text-[10px] text-muted-foreground mt-1">Leave empty to simulate realistic comment patterns</p>
                </div>
                <button onClick={analyzeComments} disabled={analyzingComments}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {analyzingComments ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  {analyzingComments ? "Analyzing..." : "Analyze Intelligence"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {commentInsights.length === 0 ? (
            <div className="py-12 text-center glass rounded-xl border border-border">
              <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No comment reports yet</p>
              <p className="text-xs text-muted-foreground mt-1">Paste comments from your videos to decode audience psychology</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commentInsights.map((ci) => (
                <motion.div key={ci.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl border border-border p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ci.platform} Analysis</p>
                      <p className="text-xs text-muted-foreground">{ci.totalComments} comments · {new Date(ci.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black ${(ci.sentimentScore ?? 0) > 0.3 ? "text-emerald-400" : (ci.sentimentScore ?? 0) > 0 ? "text-yellow-400" : "text-red-400"}`}>
                        {ci.dominantEmotion}
                      </div>
                      <div className="text-[10px] text-muted-foreground">dominant emotion</div>
                    </div>
                  </div>
                  {ci.painPoints && ci.painPoints.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pain Points</p>
                      {ci.painPoints.slice(0, 3).map((p, i) => (
                        <p key={i} className="text-xs text-foreground flex items-start gap-1.5 mb-1">
                          <ChevronRight className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />{p}
                        </p>
                      ))}
                    </div>
                  )}
                  {ci.actionableTakeaways && ci.actionableTakeaways.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Next Video Ideas</p>
                      {ci.actionableTakeaways.slice(0, 2).map((t, i) => (
                        <p key={i} className="text-xs text-primary flex items-start gap-1.5 mb-1">
                          <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />{t}
                        </p>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
