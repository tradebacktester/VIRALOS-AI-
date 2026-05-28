import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Plus, Loader2, RefreshCw, Zap, TrendingUp,
  Play, Layers, ChevronLeft, ChevronRight, CheckCircle, Clock,
  Film, X, Sparkles, Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarEntry {
  id: number;
  date: string;
  platform: string;
  contentType: string;
  pillar?: string;
  theme?: string;
  hookIdea?: string;
  emotionalAngle?: string;
  optimalUploadTime?: string;
  predictedViralScore?: number;
  aiRationale?: string;
  isPosted: boolean;
  isGenerated: boolean;
}

interface ContentSeries {
  id: number;
  name: string;
  niche: string;
  platform: string;
  emotionalArc: string;
  targetEpisodes: number;
  episodesCreated: number;
  isActive: boolean;
  description?: string;
  bingeScore?: number;
}

const CONTENT_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  hook_test: { label: "Hook Test", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  trend_surf: { label: "Trend Surf", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  series_episode: { label: "Series", color: "text-violet-400", bg: "bg-violet-400/10" },
  educational: { label: "Educational", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  viral_attempt: { label: "Viral Attempt", color: "text-primary", bg: "bg-primary/10" },
  emotional: { label: "Emotional", color: "text-pink-400", bg: "bg-pink-400/10" },
};

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "text-pink-400",
  youtube_shorts: "text-red-400",
  reels: "text-purple-400",
  twitter: "text-sky-400",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getCalendarGrid(year: number, month: number): Array<string | null> {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: Array<string | null> = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    grid.push(`${year}-${mm}-${dd}`);
  }
  return grid;
}

export default function ContentCalendar() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [series, setSeries] = useState<ContentSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingSeries, setGeneratingSeries] = useState(false);
  const [tab, setTab] = useState<"calendar" | "series">("calendar");

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [genForm, setGenForm] = useState({ niche: "", platforms: "tiktok,youtube_shorts,reels", daysAhead: "14", goal: "grow virally" });
  const [showGenForm, setShowGenForm] = useState(false);

  const [seriesForm, setSeriesForm] = useState({ niche: "", platform: "tiktok", targetEpisodes: "10" });
  const [showSeriesForm, setShowSeriesForm] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [calRes, serRes] = await Promise.all([
        fetch("/api/calendar"),
        fetch("/api/calendar/series"),
      ]);
      const [cal, ser] = await Promise.all([calRes.json(), serRes.json()]);
      setEntries(Array.isArray(cal) ? cal : []);
      setSeries(Array.isArray(ser) ? ser : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const generateCalendar = async () => {
    if (!genForm.niche.trim()) { toast({ title: "Enter a niche", variant: "destructive" }); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/calendar/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: genForm.niche,
          platforms: genForm.platforms.split(",").map((s) => s.trim()),
          daysAhead: Number(genForm.daysAhead),
          goal: genForm.goal,
        }),
      });
      const data = await res.json();
      toast({ title: `Calendar generated — ${data.data?.weeklyPlan?.length ?? 0} days planned` });
      setShowGenForm(false);
      fetchAll();
    } catch { toast({ title: "Generation failed", variant: "destructive" }); }
    finally { setGenerating(false); }
  };

  const generateSeries = async () => {
    if (!seriesForm.niche.trim()) { toast({ title: "Enter a niche", variant: "destructive" }); return; }
    setGeneratingSeries(true);
    try {
      const res = await fetch("/api/calendar/series/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: seriesForm.niche, platform: seriesForm.platform, targetEpisodes: Number(seriesForm.targetEpisodes) }),
      });
      const data = await res.json();
      toast({ title: `Series designed — "${data.data?.seriesName}"` });
      setShowSeriesForm(false);
      fetchAll();
    } catch { toast({ title: "Series generation failed", variant: "destructive" }); }
    finally { setGeneratingSeries(false); }
  };

  const grid = getCalendarGrid(viewYear, viewMonth);
  const entriesForDate = (date: string) => entries.filter((e) => e.date === date);
  const selectedEntries = selectedDate ? entriesForDate(selectedDate) : [];

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); };

  const viralBg = (score: number) => score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-yellow-400" : "bg-muted-foreground";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-400" /> Content Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-generated daily posting plans, series, and trend timing</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowGenForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Zap className="w-4 h-4" /> Generate Plan
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showGenForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-xl border border-primary/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Generate AI Content Plan</h3>
              <button onClick={() => setShowGenForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Niche</label>
                <input value={genForm.niche} onChange={(e) => setGenForm((p) => ({ ...p, niche: e.target.value }))}
                  placeholder="dark motivation, finance, fitness..." className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Days Ahead</label>
                <select value={genForm.daysAhead} onChange={(e) => setGenForm((p) => ({ ...p, daysAhead: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                  {["7", "14", "21", "30"].map((d) => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Goal</label>
                <input value={genForm.goal} onChange={(e) => setGenForm((p) => ({ ...p, goal: e.target.value }))}
                  placeholder="grow virally" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <button onClick={generateCalendar} disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {generating ? "AI generating plan..." : "Generate Calendar"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1 border-b border-border">
        {[{ id: "calendar", label: "Calendar View", icon: CalendarDays }, { id: "series", label: "Content Series", icon: Film }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {tab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 glass rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{MONTHS[viewMonth]} {viewYear}</h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((date, i) => {
                if (!date) return <div key={i} />;
                const dayEntries = entriesForDate(date);
                const isToday = date === new Date().toISOString().split("T")[0];
                const isSelected = date === selectedDate;
                return (
                  <button key={date} onClick={() => setSelectedDate(date === selectedDate ? null : date)}
                    className={`min-h-[52px] p-1 rounded-lg border text-left transition-all ${
                      isSelected ? "border-primary bg-primary/10"
                      : isToday ? "border-primary/40 bg-primary/5"
                      : "border-transparent hover:border-border"
                    }`}>
                    <p className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                      {parseInt(date.split("-")[2])}
                    </p>
                    {dayEntries.slice(0, 2).map((e, ei) => {
                      const meta = CONTENT_TYPE_META[e.contentType] ?? CONTENT_TYPE_META.viral_attempt;
                      return (
                        <div key={ei} className={`text-[8px] px-1 py-0.5 rounded mb-0.5 truncate ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </div>
                      );
                    })}
                    {dayEntries.length > 2 && <p className="text-[8px] text-muted-foreground">+{dayEntries.length - 2}</p>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day detail */}
          <div className="glass rounded-xl border border-border p-5">
            {!selectedDate ? (
              <div className="py-8 text-center">
                <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a date</p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">{new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h3>
                {selectedEntries.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No content planned</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEntries.map((entry) => {
                      const meta = CONTENT_TYPE_META[entry.contentType] ?? CONTENT_TYPE_META.viral_attempt;
                      return (
                        <div key={entry.id} className={`p-3 rounded-lg border border-border`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${meta.bg} ${meta.color}`}>{meta.label}</span>
                            <span className={`text-[10px] ${PLATFORM_COLORS[entry.platform] ?? "text-muted-foreground"}`}>{entry.platform}</span>
                            {entry.isPosted && <CheckCircle className="w-3 h-3 text-emerald-400 ml-auto" />}
                          </div>
                          {entry.hookIdea && <p className="text-xs font-medium text-foreground mb-1">"{entry.hookIdea}"</p>}
                          {entry.theme && <p className="text-[10px] text-muted-foreground">{entry.theme}</p>}
                          {entry.emotionalAngle && <p className="text-[10px] text-muted-foreground">Emotion: {entry.emotionalAngle}</p>}
                          {entry.optimalUploadTime && (
                            <div className="flex items-center gap-1 mt-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{entry.optimalUploadTime}</span>
                              {entry.predictedViralScore != null && entry.predictedViralScore > 0 && (
                                <>
                                  <span className="mx-1 text-muted-foreground">·</span>
                                  <div className={`w-1.5 h-1.5 rounded-full ${viralBg(entry.predictedViralScore)}`} />
                                  <span className="text-[10px] text-muted-foreground">{entry.predictedViralScore}% viral</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "series" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowSeriesForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Design Series
            </button>
          </div>

          <AnimatePresence>
            {showSeriesForm && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass rounded-xl border border-violet-400/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Design Serialized Content</h3>
                  <button onClick={() => setShowSeriesForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Niche</label>
                    <input value={seriesForm.niche} onChange={(e) => setSeriesForm((p) => ({ ...p, niche: e.target.value }))}
                      placeholder="dark motivation..." className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
                    <select value={seriesForm.platform} onChange={(e) => setSeriesForm((p) => ({ ...p, platform: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      {["tiktok", "youtube_shorts", "reels"].map((pl) => <option key={pl} value={pl}>{pl}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Episodes</label>
                    <select value={seriesForm.targetEpisodes} onChange={(e) => setSeriesForm((p) => ({ ...p, targetEpisodes: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      {["5","10","15","20"].map((n) => <option key={n} value={n}>{n} episodes</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={generateSeries} disabled={generatingSeries}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {generatingSeries ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                  {generatingSeries ? "AI designing series..." : "Design Series"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {series.length === 0 ? (
            <div className="py-12 text-center glass rounded-xl border border-border">
              <Film className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No series designed yet</p>
              <p className="text-xs text-muted-foreground mt-1">Design a serialized content series to maximize binge-watching</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {series.map((s) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl border border-violet-400/20 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.niche} · {s.platform}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${s.isActive ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-muted/30 text-muted-foreground border-border"}`}>
                      {s.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      ["Episodes", `${s.episodesCreated}/${s.targetEpisodes}`],
                      ["Arc", s.emotionalArc?.replace(/_/g, " ")],
                      ["Binge Score", s.bingeScore ? `${s.bingeScore}/10` : "—"],
                    ].map(([label, val]) => (
                      <div key={label} className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-xs font-bold text-foreground">{val}</p>
                        <p className="text-[9px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full" style={{ width: `${(s.episodesCreated / s.targetEpisodes) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.episodesCreated} of {s.targetEpisodes} episodes created</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
