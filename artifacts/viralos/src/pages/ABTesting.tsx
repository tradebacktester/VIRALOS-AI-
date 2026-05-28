import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Plus, Play, CheckCircle, Loader2, RefreshCw,
  Zap, Type, Image, Clock, Target, TrendingUp, Trophy, X,
  BarChart3, ChevronRight, Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ABVariant {
  id: string;
  label: string;
  content: string;
  impressions: number;
  views: number;
  retention: number;
  engagement: number;
  score: number;
}
interface ABTest {
  id: number;
  name: string;
  testType: string;
  status: string;
  platform?: string;
  variants: ABVariant[];
  winnerId?: string;
  winnerReason?: string;
  confidenceLevel?: number;
  totalImpressions?: number;
  insights?: string[];
  startedAt: string;
  completedAt?: string;
}

const TEST_TYPES = [
  { id: "hook", label: "Hook", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", desc: "Test different opening hooks" },
  { id: "caption", label: "Caption Style", icon: Type, color: "text-violet-400", bg: "bg-violet-400/10", desc: "Compare caption aesthetics" },
  { id: "thumbnail", label: "Thumbnail", icon: Image, color: "text-cyan-400", bg: "bg-cyan-400/10", desc: "Test thumbnail concepts" },
  { id: "cta", label: "CTA", icon: Target, color: "text-orange-400", bg: "bg-orange-400/10", desc: "A/B test call-to-actions" },
  { id: "upload_time", label: "Upload Time", icon: Clock, color: "text-emerald-400", bg: "bg-emerald-400/10", desc: "Find optimal posting time" },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

const variantScore = (v: ABVariant) => {
  return Math.round(((v.retention ?? 0) * 0.4 + (v.engagement ?? 0) * 3 + (v.score ?? 0) * 3) * 10) / 10;
};

export default function ABTesting() {
  const { toast } = useToast();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [simulating, setSimulating] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTest, setNewTest] = useState({ testType: "hook", prompt: "", platform: "tiktok" });

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ab-tests");
      const data = await res.json();
      setTests(Array.isArray(data) ? data : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchTests(); }, []);

  const generateTest = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ab-tests/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest),
      });
      const test = await res.json();
      setTests((p) => [test, ...p]);
      setCreating(false);
      setNewTest({ testType: "hook", prompt: "", platform: "tiktok" });
      toast({ title: `A/B Test created — ${test.name}` });
    } catch { toast({ title: "Generation failed", variant: "destructive" }); }
    finally { setGenerating(false); }
  };

  const simulateTest = async (id: number) => {
    setSimulating(id);
    try {
      const res = await fetch(`/api/ab-tests/${id}/simulate`, { method: "POST" });
      const updated = await res.json();
      setTests((p) => p.map((t) => t.id === id ? updated : t));
      if (selectedTest?.id === id) setSelectedTest(updated);
      toast({ title: `Test complete — winner: ${updated.winnerId}` });
    } catch { toast({ title: "Simulation failed", variant: "destructive" }); }
    finally { setSimulating(null); }
  };

  const deleteTest = async (id: number) => {
    await fetch(`/api/ab-tests/${id}`, { method: "DELETE" });
    setTests((p) => p.filter((t) => t.id !== id));
    if (selectedTest?.id === id) setSelectedTest(null);
  };

  const winner = selectedTest ? selectedTest.variants?.find((v) => v.id === selectedTest.winnerId) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-violet-400" /> A/B Testing Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI automatically tests hooks, captions, thumbnails, and CTAs — picks winners autonomously</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Test
        </button>
      </div>

      {/* Test type cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {TEST_TYPES.map((type) => {
          const Icon = type.icon;
          const count = tests.filter((t) => t.testType === type.id).length;
          return (
            <div key={type.id} className={`glass rounded-xl border border-border p-3 cursor-pointer hover:border-primary/30 transition-colors`}>
              <div className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${type.color}`} />
              </div>
              <p className="text-xs font-semibold text-foreground">{type.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{count} test{count !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-xl border border-primary/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Create New A/B Test</h3>
              <button onClick={() => setCreating(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Test Type</label>
                <select value={newTest.testType} onChange={(e) => setNewTest((p) => ({ ...p, testType: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                  {TEST_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
                <select value={newTest.platform} onChange={(e) => setNewTest((p) => ({ ...p, platform: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                  {["tiktok", "youtube", "instagram", "twitter"].map((pl) => <option key={pl} value={pl}>{pl}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Topic / Prompt</label>
                <input value={newTest.prompt} onChange={(e) => setNewTest((p) => ({ ...p, prompt: e.target.value }))}
                  placeholder="e.g. dark motivation" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <button onClick={generateTest} disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              {generating ? "Generating variants..." : "Generate Test"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tests list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">All Tests</h2>
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)
          ) : tests.length === 0 ? (
            <div className="py-12 text-center glass rounded-xl border border-border">
              <FlaskConical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tests yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first A/B test to start optimizing</p>
            </div>
          ) : (
            tests.map((test) => {
              const typeInfo = TEST_TYPES.find((t) => t.id === test.testType);
              const Icon = typeInfo?.icon ?? FlaskConical;
              const isSelected = selectedTest?.id === test.id;
              return (
                <motion.div key={test.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setSelectedTest(test)}
                  className={`glass rounded-xl border p-4 cursor-pointer transition-all ${isSelected ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${typeInfo?.bg ?? "bg-muted/30"} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${typeInfo?.color ?? "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{test.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                          test.status === "completed" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                          : "bg-primary/10 text-primary border-primary/20"
                        }`}>{test.status}</span>
                        {test.totalImpressions ? <span className="text-[10px] text-muted-foreground">{test.totalImpressions.toLocaleString()} impressions</span> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {test.status === "running" && (
                        <button onClick={(e) => { e.stopPropagation(); simulateTest(test.id); }} disabled={simulating === test.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
                          {simulating === test.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                          Run
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteTest(test.id); }} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Test detail */}
        <div>
          {!selectedTest ? (
            <div className="py-12 text-center glass rounded-xl border border-border h-full flex flex-col items-center justify-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Select a test to view results</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={selectedTest.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="glass rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">{selectedTest.name}</h3>

                  {winner && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 mb-4">
                      <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-400">Winner: {winner.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{selectedTest.winnerReason}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">{Math.round((selectedTest.confidenceLevel ?? 0) * 100)}%</span>
                    </div>
                  )}

                  {/* Variant chart */}
                  {(selectedTest.variants ?? []).some((v) => v.retention > 0) && (
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Retention by Variant</p>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={selectedTest.variants ?? []} barCategoryGap="25%">
                          <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                          <Bar dataKey="retention" radius={[3, 3, 0, 0]} name="Retention %">
                            {(selectedTest.variants ?? []).map((v, i) => (
                              <Cell key={i} fill={v.id === selectedTest.winnerId ? "#10b981" : COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Variants list */}
                  <div className="space-y-2">
                    {(selectedTest.variants ?? []).map((v, i) => {
                      const isWinner = v.id === selectedTest.winnerId;
                      return (
                        <div key={v.id} className={`p-3 rounded-lg border ${isWinner ? "border-emerald-400/30 bg-emerald-400/5" : "border-border"}`}>
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground w-4 shrink-0 pt-0.5">{String.fromCharCode(65 + i)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{v.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{v.content}</p>
                              {v.retention > 0 && (
                                <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                  <span>Ret: <span className="text-foreground">{Math.round(v.retention)}%</span></span>
                                  <span>Eng: <span className="text-foreground">{v.engagement?.toFixed(1)}%</span></span>
                                  <span>Views: <span className="text-foreground">{v.views?.toLocaleString()}</span></span>
                                </div>
                              )}
                            </div>
                            {isWinner && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Insights */}
                  {selectedTest.insights && selectedTest.insights.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Insights</p>
                      {selectedTest.insights.map((ins, i) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
                          <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />{ins}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
