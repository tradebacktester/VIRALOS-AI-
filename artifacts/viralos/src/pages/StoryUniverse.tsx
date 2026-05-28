import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clapperboard, Plus, Loader2, X, Users, BookOpen, Layers,
  ChevronRight, Sparkles, Film, Trash2, Eye, Radio,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Character { name: string; archetype: string; backstory: string; voiceTone: string; role: string; }
interface NarrativeArc { arcName: string; episodes: number; tensionBuild: string; climax: string; payoff: string; }
interface StoryUniverse {
  id: number; name: string; niche: string; logline?: string;
  worldDescription?: string; characters?: Character[]; narrativeArcs?: NarrativeArc[];
  recurringThemes?: string[]; visualLore?: string;
  audienceAttachmentStrategy?: string; bingeLoopDesign?: string;
  episodesProduced?: number; isActive?: boolean; createdAt: string;
}

const ARC_COLORS = ["border-red-400/30 bg-red-400/5", "border-violet-400/30 bg-violet-400/5", "border-cyan-400/30 bg-cyan-400/5", "border-amber-400/30 bg-amber-400/5"];
const ARCHETYPE_COLORS: Record<string, string> = {
  hero: "text-yellow-400 bg-yellow-400/10",
  villain: "text-red-400 bg-red-400/10",
  mentor: "text-cyan-400 bg-cyan-400/10",
  "anti-hero": "text-violet-400 bg-violet-400/10",
};

export default function StoryUniverse() {
  const { toast } = useToast();
  const [universes, setUniverses] = useState<StoryUniverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [selected, setSelected] = useState<StoryUniverse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ niche: "", universeTheme: "", episodeCount: "12" });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand/universes");
      const data = await res.json();
      setUniverses(Array.isArray(data) ? data : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const buildUniverse = async () => {
    if (!form.niche || !form.universeTheme) { toast({ title: "Fill in niche and theme", variant: "destructive" }); return; }
    setBuilding(true);
    try {
      const res = await fetch("/api/brand/universes/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: form.niche, universeTheme: form.universeTheme, episodeCount: Number(form.episodeCount) }),
      });
      const result = await res.json();
      const u = result.data ?? result;
      toast({ title: `Universe created — ${u.universeName ?? u.name}` });
      setShowForm(false);
      setForm({ niche: "", universeTheme: "", episodeCount: "12" });
      fetchAll();
    } catch { toast({ title: "Build failed", variant: "destructive" }); }
    finally { setBuilding(false); }
  };

  const deleteUniverse = async (id: number) => {
    await fetch(`/api/brand/universes/${id}`, { method: "DELETE" });
    setUniverses((p) => p.filter((u) => u.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-amber-400" /> Story Universe System
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Build cinematic connected universes — recurring characters, evolving narratives, binge loops engineered for audience addiction</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-semibold hover:bg-amber-400/20 transition-colors">
          <Plus className="w-4 h-4" /> Create Universe
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl border border-amber-400/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Design Story Universe</h3>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Niche</label>
                <input value={form.niche} onChange={(e) => setForm((p) => ({ ...p, niche: e.target.value }))}
                  placeholder="dark motivation, MMA, finance..." className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/40" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Universe Theme / Concept</label>
                <input value={form.universeTheme} onChange={(e) => setForm((p) => ({ ...p, universeTheme: e.target.value }))}
                  placeholder="The Last Champion, Ghost Entrepreneur..." className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/40" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Episodes to Plan</label>
                <select value={form.episodeCount} onChange={(e) => setForm((p) => ({ ...p, episodeCount: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/40">
                  {["6","12","18","24"].map((n) => <option key={n} value={n}>{n} episodes</option>)}
                </select>
              </div>
            </div>
            <button onClick={buildUniverse} disabled={building}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50">
              {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
              {building ? "Building universe..." : "Create Universe"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Universe list */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Universes ({universes.length})</h2>
          {loading ? (
            [1,2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)
          ) : universes.length === 0 ? (
            <div className="py-10 text-center glass rounded-xl border border-border">
              <Clapperboard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No universes yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first story universe to build audience addiction</p>
            </div>
          ) : (
            universes.map((u) => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelected(u)}
                className={`glass rounded-xl border p-4 cursor-pointer transition-all ${selected?.id === u.id ? "border-amber-400/40 bg-amber-400/5" : "border-border hover:border-amber-400/20"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.niche}</p>
                    {u.logline && <p className="text-[10px] text-muted-foreground mt-1 italic line-clamp-2">"{u.logline}"</p>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteUniverse(u.id); }} className="text-muted-foreground hover:text-red-400 transition-colors ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground">{u.characters?.length ?? 0} characters · {u.narrativeArcs?.length ?? 0} arcs</span>
                  {u.isActive && <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400"><Radio className="w-2.5 h-2.5" />Active</span>}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Universe detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="py-20 text-center glass rounded-xl border border-border">
              <Clapperboard className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a universe to explore</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Header */}
                <div className="glass rounded-xl border border-amber-400/20 p-5">
                  <h2 className="text-xl font-black text-foreground mb-1">{selected.name}</h2>
                  {selected.logline && <p className="text-sm text-muted-foreground italic mb-3">"{selected.logline}"</p>}
                  {selected.worldDescription && <p className="text-xs text-foreground/80">{selected.worldDescription}</p>}
                  {selected.recurringThemes && selected.recurringThemes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selected.recurringThemes.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Characters */}
                {selected.characters && selected.characters.length > 0 && (
                  <div className="glass rounded-xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> Characters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selected.characters.map((char, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border bg-muted/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${ARCHETYPE_COLORS[char.archetype] ?? "text-muted-foreground bg-muted/30"}`}>
                              {char.archetype}
                            </span>
                            <p className="text-sm font-bold text-foreground">{char.name}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-1">{char.backstory}</p>
                          <p className="text-[10px] text-primary">Voice: {char.voiceTone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Narrative Arcs */}
                {selected.narrativeArcs && selected.narrativeArcs.length > 0 && (
                  <div className="glass rounded-xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-400" /> Narrative Arcs</h3>
                    <div className="space-y-3">
                      {selected.narrativeArcs.map((arc, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${ARC_COLORS[i % ARC_COLORS.length]}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-foreground">{arc.arcName}</p>
                            <span className="text-[10px] text-muted-foreground">{arc.episodes} episodes</span>
                          </div>
                          <div className="space-y-1">
                            {[["Tension Build", arc.tensionBuild], ["Climax", arc.climax], ["Payoff", arc.payoff]].map(([label, val]) => (
                              <p key={label} className="text-[10px] text-foreground/80 flex items-start gap-1.5">
                                <span className="text-muted-foreground shrink-0">{label}:</span> {val}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Binge Strategy */}
                {(selected.bingeLoopDesign || selected.audienceAttachmentStrategy) && (
                  <div className="glass rounded-xl border border-red-400/20 p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Film className="w-4 h-4 text-red-400" /> Binge Engineering</h3>
                    {selected.bingeLoopDesign && (
                      <div>
                        <p className="text-[9px] font-semibold text-red-400 uppercase tracking-wider mb-1">Binge Loop Design</p>
                        <p className="text-xs text-foreground">{selected.bingeLoopDesign}</p>
                      </div>
                    )}
                    {selected.audienceAttachmentStrategy && (
                      <div>
                        <p className="text-[9px] font-semibold text-pink-400 uppercase tracking-wider mb-1">Audience Attachment Strategy</p>
                        <p className="text-xs text-foreground">{selected.audienceAttachmentStrategy}</p>
                      </div>
                    )}
                    {selected.visualLore && (
                      <div>
                        <p className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Visual Lore</p>
                        <p className="text-xs text-foreground">{selected.visualLore}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
