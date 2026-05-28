import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dna, Plus, Loader2, Zap, Upload, ChevronRight, Star, Download,
  X, Play, Type, Eye, Music, Film, Brain, Trash2, RefreshCw, Wand2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StyleProfile {
  id: number; name: string; creatorHandle?: string; category?: string;
  description?: string; viralScore?: number; avgRetention?: number;
  rating?: number; downloads?: number; isMarketplaceListing?: boolean;
  hookDNA?: Record<string, unknown>; pacingDNA?: Record<string, unknown>;
  emotionalDNA?: Record<string, unknown>; visualDNA?: Record<string, unknown>;
  typographyDNA?: Record<string, unknown>; storytellingDNA?: Record<string, unknown>;
  tags?: string[]; price?: number; createdAt: string;
}

const DNA_SECTIONS = [
  { key: "hookDNA", label: "Hook DNA", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { key: "pacingDNA", label: "Pacing DNA", icon: Play, color: "text-primary", bg: "bg-primary/10" },
  { key: "emotionalDNA", label: "Emotional DNA", icon: Brain, color: "text-pink-400", bg: "bg-pink-400/10" },
  { key: "visualDNA", label: "Visual DNA", icon: Eye, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { key: "typographyDNA", label: "Typography DNA", icon: Type, color: "text-violet-400", bg: "bg-violet-400/10" },
  { key: "storytellingDNA", label: "Storytelling DNA", icon: Film, color: "text-orange-400", bg: "bg-orange-400/10" },
];

const CATEGORIES = ["motivation", "education", "finance", "sports", "lifestyle", "gaming", "comedy", "health"];

export default function PersonalityClone() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<StyleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [applying, setApplying] = useState(false);
  const [selected, setSelected] = useState<StyleProfile | null>(null);
  const [activeDNA, setActiveDNA] = useState("hookDNA");
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const [cloneForm, setCloneForm] = useState({
    creatorHandle: "", styleDescription: "", category: "motivation",
    sampleScript1: "", sampleScript2: "",
  });
  const [applyForm, setApplyForm] = useState({ rawScript: "", topic: "" });
  const [applyResult, setApplyResult] = useState<Record<string, unknown> | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/personality/profiles");
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const cloneStyle = async () => {
    if (!cloneForm.creatorHandle || !cloneForm.styleDescription) {
      toast({ title: "Fill in handle and description", variant: "destructive" }); return;
    }
    setCloning(true);
    try {
      const res = await fetch("/api/personality/clone", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorHandle: cloneForm.creatorHandle,
          styleDescription: cloneForm.styleDescription,
          category: cloneForm.category,
          sampleScripts: [cloneForm.sampleScript1, cloneForm.sampleScript2].filter(Boolean),
        }),
      });
      const result = await res.json();
      toast({ title: `Style genome cloned — @${cloneForm.creatorHandle}` });
      setShowCloneForm(false);
      setCloneForm({ creatorHandle: "", styleDescription: "", category: "motivation", sampleScript1: "", sampleScript2: "" });
      fetchProfiles();
    } catch { toast({ title: "Cloning failed", variant: "destructive" }); }
    finally { setCloning(false); }
  };

  const applyStyle = async () => {
    if (!selected || !applyForm.topic) { toast({ title: "Enter a topic", variant: "destructive" }); return; }
    setApplying(true);
    try {
      const res = await fetch(`/api/personality/apply/${selected.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm),
      });
      const result = await res.json();
      setApplyResult(result.data ?? result);
      toast({ title: `Content transformed in ${selected.name} style` });
    } catch { toast({ title: "Style application failed", variant: "destructive" }); }
    finally { setApplying(false); }
  };

  const deleteProfile = async (id: number) => {
    await fetch(`/api/personality/profiles/${id}`, { method: "DELETE" });
    setProfiles((p) => p.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const renderDNAValue = (val: unknown): string => {
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object" && val !== null) return JSON.stringify(val);
    return String(val ?? "—");
  };

  const dnaSection = selected ? DNA_SECTIONS.find((s) => s.key === activeDNA) : null;
  const dnaData = selected ? (selected[activeDNA as keyof StyleProfile] as Record<string, unknown>) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Dna className="w-6 h-6 text-cyan-400" /> Personality Clone Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Extract any creator's style into a reusable DNA genome — then generate content in their exact format
          </p>
        </div>
        <button onClick={() => setShowCloneForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-colors">
          <Plus className="w-4 h-4" /> Clone Creator Style
        </button>
      </div>

      {/* Clone Form */}
      <AnimatePresence>
        {showCloneForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl border border-cyan-500/20 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cyan-400" /> Extract Style Genome
              </h3>
              <button onClick={() => setShowCloneForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Creator Handle</label>
                <input value={cloneForm.creatorHandle} onChange={(e) => setCloneForm((p) => ({ ...p, creatorHandle: e.target.value }))}
                  placeholder="@alexhormozi" className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
                <select value={cloneForm.category} onChange={(e) => setCloneForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500/50">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Style Description</label>
                <input value={cloneForm.styleDescription} onChange={(e) => setCloneForm((p) => ({ ...p, styleDescription: e.target.value }))}
                  placeholder="Dark, intense, fast cuts, yellow captions..." className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Sample Script / Transcript (optional — leave empty to infer from description)</label>
                <textarea value={cloneForm.sampleScript1} onChange={(e) => setCloneForm((p) => ({ ...p, sampleScript1: e.target.value }))}
                  placeholder={"Paste a sample video transcript or caption text...\nThe more specific, the better the genome extraction."}
                  rows={4} className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 resize-none" />
              </div>
            </div>
            <button onClick={cloneStyle} disabled={cloning}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50">
              {cloning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
              {cloning ? "Extracting genome..." : "Extract Style DNA"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile list */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style Profiles ({profiles.length})</h2>
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)
          ) : profiles.filter((p) => !p.isMarketplaceListing).length === 0 ? (
            <div className="py-10 text-center glass rounded-xl border border-border">
              <Dna className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No custom profiles yet</p>
              <p className="text-xs text-muted-foreground mt-1">Clone a creator's style to build your first genome</p>
            </div>
          ) : (
            profiles.filter((p) => !p.isMarketplaceListing).map((profile) => (
              <motion.div key={profile.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => { setSelected(profile); setApplyResult(null); }}
                className={`glass rounded-xl border p-4 cursor-pointer transition-all ${selected?.id === profile.id ? "border-cyan-500/40 bg-cyan-500/5" : "border-border hover:border-cyan-500/20"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.category} · {new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }} className="text-muted-foreground hover:text-red-400 transition-colors ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>Viral: <span className="text-emerald-400 font-bold">{profile.viralScore}%</span></span>
                  <span>Retention: <span className="text-primary font-bold">{profile.avgRetention}%</span></span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* DNA Detail + Apply */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="py-20 text-center glass rounded-xl border border-border">
              <Dna className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a style profile to view its DNA</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Profile header */}
                <div className="glass rounded-xl border border-cyan-500/20 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground">{selected.description}</p>
                    </div>
                    <div className="flex gap-3 text-center">
                      <div className="px-3 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                        <div className="text-xl font-black text-emerald-400">{selected.viralScore}%</div>
                        <div className="text-[9px] text-muted-foreground">Viral Score</div>
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="text-xl font-black text-primary">{selected.avgRetention}%</div>
                        <div className="text-[9px] text-muted-foreground">Retention</div>
                      </div>
                    </div>
                  </div>

                  {/* DNA section tabs */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {DNA_SECTIONS.map(({ key, label, icon: Icon, color, bg }) => (
                      <button key={key} onClick={() => setActiveDNA(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${activeDNA === key ? `${bg} ${color} border border-current/20` : "border border-border text-muted-foreground hover:text-foreground"}`}>
                        <Icon className="w-3 h-3" />{label}
                      </button>
                    ))}
                  </div>

                  {/* DNA data */}
                  {dnaData && dnaSection && (
                    <div className={`rounded-xl ${dnaSection.bg} border border-current/10 p-4`}>
                      <div className="flex items-center gap-2 mb-3">
                        <dnaSection.icon className={`w-4 h-4 ${dnaSection.color}`} />
                        <span className={`text-xs font-bold ${dnaSection.color}`}>{dnaSection.label}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(dnaData).map(([key, val]) => (
                          <div key={key} className="space-y-0.5">
                            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="text-xs text-foreground font-medium">
                              {Array.isArray(val) ? (
                                <span className="text-muted-foreground">
                                  {(val as string[]).slice(0, 2).join(" · ")}
                                  {(val as unknown[]).length > 2 && " · ..."}
                                </span>
                              ) : renderDNAValue(val)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply style */}
                <div className="glass rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-cyan-400" /> Apply Style to Content
                  </h3>
                  <div className="space-y-3">
                    <input value={applyForm.topic} onChange={(e) => setApplyForm((p) => ({ ...p, topic: e.target.value }))}
                      placeholder="Video topic (e.g. 'Why 99% of people stay broke')"
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50" />
                    <textarea value={applyForm.rawScript} onChange={(e) => setApplyForm((p) => ({ ...p, rawScript: e.target.value }))}
                      placeholder="Optional: paste a raw script to transform..."
                      rows={3} className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 resize-none" />
                    <button onClick={applyStyle} disabled={applying || !applyForm.topic}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50">
                      {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      {applying ? "Transforming..." : "Transform in This Style"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {applyResult && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border">
                          <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-2">Styled Script</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{String(applyResult.styledScript ?? "")}</p>
                        </div>
                        {Array.isArray(applyResult.hooks) && (
                          <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
                            <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-2">Hook Variants</p>
                            {(applyResult.hooks as string[]).map((h, i) => (
                              <p key={i} className="text-xs text-foreground mb-1.5">"{h}"</p>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
