import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, Brain, Zap, Eye, Activity, Type, TrendingUp, Target, Sparkles,
  RefreshCw, Loader2, Trash2, ChevronRight, BarChart3, Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MemoryEntry {
  id: number;
  agentType: string;
  memoryKey: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface MemoryStats {
  byAgent: Record<string, { count: number; avgScore: number; topMemory: string }>;
  totalMemories: number;
  avgScore: number;
}

const AGENT_META: Record<string, { icon: React.FC<{ className?: string }>; color: string; bg: string; border: string; label: string }> = {
  hook_agent: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Hook Agent" },
  emotion_agent: { icon: Brain, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20", label: "Emotion Agent" },
  visual_director: { icon: Eye, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", label: "Visual Director" },
  retention_agent: { icon: Activity, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", label: "Retention Agent" },
  caption_agent: { icon: Type, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", label: "Caption Agent" },
  trend_agent: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Trend Agent" },
  virality_engine: { icon: Target, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Virality Engine" },
  jarvis: { icon: Sparkles, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "JARVIS" },
  content_strategy: { icon: BarChart3, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", label: "Strategy Agent" },
};

const DEFAULT_AGENT_META = {
  icon: Database,
  color: "text-muted-foreground",
  bg: "bg-muted/30",
  border: "border-border",
  label: "Agent",
};

const scoreColor = (score: number) => {
  if (score >= 7) return "text-emerald-400";
  if (score >= 4) return "text-yellow-400";
  return "text-muted-foreground";
};

const scoreBg = (score: number) => {
  if (score >= 7) return "bg-emerald-400";
  if (score >= 4) return "bg-yellow-400";
  return "bg-muted-foreground";
};

export default function MemoryVault() {
  const { toast } = useToast();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [memRes, statsRes] = await Promise.all([
        fetch("/api/agents/memory"),
        fetch("/api/analytics/memory-stats"),
      ]);
      const [memData, statsData] = await Promise.all([memRes.json(), statsRes.json()]);
      setMemories(Array.isArray(memData) ? memData : []);
      setStats(statsData);
    } catch {
      toast({ title: "Failed to load memory vault", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteMemory = async (agentType: string, key: string) => {
    setDeleting(`${agentType}:${key}`);
    try {
      await fetch(`/api/agents/memory/${agentType}/${key}`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => !(m.agentType === agentType && m.memoryKey === key)));
      toast({ title: "Memory deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const agentTypes = Array.from(new Set(memories.map((m) => m.agentType)));
  const filtered = selectedAgent ? memories.filter((m) => m.agentType === selectedAgent) : memories;

  const topMemories = [...memories].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" /> AI Memory Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cross-session learning — every high-performing pattern stored and recalled</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl border border-amber-400/20 p-4 text-center">
            <div className="text-3xl font-black text-amber-400">{stats.totalMemories}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Memories</div>
          </div>
          <div className="glass rounded-xl border border-primary/20 p-4 text-center">
            <div className="text-3xl font-black text-primary">{Object.keys(stats.byAgent).length}</div>
            <div className="text-xs text-muted-foreground mt-1">Active Agents</div>
          </div>
          <div className="glass rounded-xl border border-emerald-400/20 p-4 text-center">
            <div className="text-3xl font-black text-emerald-400">{stats.avgScore}</div>
            <div className="text-xs text-muted-foreground mt-1">Avg Memory Score</div>
          </div>
          <div className="glass rounded-xl border border-violet-400/20 p-4 text-center">
            <div className="text-3xl font-black text-violet-400">{topMemories.length > 0 ? topMemories[0].score : 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Top Memory Score</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent memory breakdown */}
        {stats && Object.keys(stats.byAgent).length > 0 && (
          <div className="glass rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Memory by Agent</h2>
            <div className="space-y-3">
              {Object.entries(stats.byAgent).map(([agent, data]) => {
                const meta = AGENT_META[agent] ?? DEFAULT_AGENT_META;
                const Icon = meta.icon;
                const pct = Math.min(100, ((data.avgScore ?? 0) / 10) * 100);
                return (
                  <button
                    key={agent}
                    onClick={() => setSelectedAgent(selectedAgent === agent ? null : agent)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedAgent === agent ? `${meta.bg} ${meta.border}` : "border-transparent hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${meta.bg}`}>
                        <Icon className={`w-3 h-3 ${meta.color}`} />
                      </div>
                      <span className="text-xs font-medium text-foreground">{meta.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{data.count} memories</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${scoreBg(data.avgScore)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 truncate">{data.topMemory}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Top memories */}
        <div className={`glass rounded-xl border border-border p-5 ${Object.keys(stats?.byAgent ?? {}).length > 0 ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {selectedAgent ? `${AGENT_META[selectedAgent]?.label ?? selectedAgent} Memories` : "All Memories"}
            </h2>
            {selectedAgent && (
              <button onClick={() => setSelectedAgent(null)} className="text-[10px] text-primary hover:underline">
                Show all
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Database className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No memories stored yet</p>
              <p className="text-xs text-muted-foreground mt-1">Run agents to start building the memory bank</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filtered.map((memory, i) => {
                  const meta = AGENT_META[memory.agentType] ?? DEFAULT_AGENT_META;
                  const Icon = meta.icon;
                  const isDeleting = deleting === `${memory.agentType}:${memory.memoryKey}`;
                  return (
                    <motion.div
                      key={memory.id ?? i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors group"
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{meta.label}</p>
                          <span className="text-[9px] text-muted-foreground/60">·</span>
                          <p className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {memory.updatedAt ? new Date(memory.updatedAt).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed line-clamp-2">{memory.content}</p>
                        {memory.metadata && Object.keys(memory.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {Object.entries(memory.metadata).slice(0, 3).map(([k, v]) => (
                              <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                                {k}: {String(v).slice(0, 20)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className={`text-sm font-bold ${scoreColor(memory.score ?? 0)}`}>{memory.score ?? 0}</div>
                          <div className="text-[9px] text-muted-foreground">score</div>
                        </div>
                        <button
                          onClick={() => deleteMemory(memory.agentType, memory.memoryKey)}
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Top performing patterns */}
      {topMemories.length > 0 && (
        <div className="glass rounded-xl border border-amber-400/20 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Top Performing Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {topMemories.map((m, i) => {
              const meta = AGENT_META[m.agentType] ?? DEFAULT_AGENT_META;
              const Icon = meta.icon;
              return (
                <div key={i} className={`p-3 rounded-lg border ${meta.border} ${meta.bg}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-3 h-3 ${meta.color}`} />
                    <span className="text-[10px] font-semibold text-muted-foreground">{meta.label}</span>
                    <span className={`ml-auto text-xs font-bold ${scoreColor(m.score)}`}>{m.score}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed line-clamp-3">{m.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
