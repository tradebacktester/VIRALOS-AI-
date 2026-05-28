import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Download, Star, Zap, Eye, Type, Film, Play, Music,
  Brain, Filter, Search, ChevronRight, Check, Loader2, TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceItem {
  id: number; name: string; creatorHandle?: string; category?: string;
  description?: string; viralScore?: number; avgRetention?: number;
  rating?: number; downloads?: number; price?: number; tags?: string[];
  hookDNA?: Record<string, unknown>; pacingDNA?: Record<string, unknown>;
  emotionalDNA?: Record<string, unknown>; visualDNA?: Record<string, unknown>;
  typographyDNA?: Record<string, unknown>; storytellingDNA?: Record<string, unknown>;
}

const CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  motivation: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  education: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  finance: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  sports: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  lifestyle: { color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  gaming: { color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
};

const DNA_PREVIEWS = [
  { key: "hookDNA", label: "Hook", icon: Zap, field: "openingStyle" },
  { key: "pacingDNA", label: "Pace", icon: Play, field: "rhythmStyle" },
  { key: "emotionalDNA", label: "Emotion", icon: Brain, field: "primaryEmotion" },
  { key: "typographyDNA", label: "Captions", icon: Type, field: "captionStyle" },
];

export default function Marketplace() {
  const { toast } = useToast();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<number | null>(null);
  const [installed, setInstalled] = useState<number[]>([]);
  const [selected, setSelected] = useState<MarketplaceItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/personality/marketplace");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) setSelected(data[0]);
      } catch { } finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const install = async (item: MarketplaceItem) => {
    setInstalling(item.id);
    try {
      await fetch(`/api/personality/marketplace/${item.id}/install`, { method: "POST" });
      setInstalled((p) => [...p, item.id]);
      toast({ title: `${item.name} installed to your workspace` });
    } catch { toast({ title: "Install failed", variant: "destructive" }); }
    finally { setInstalling(null); }
  };

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.tags ?? []).some((t) => t.includes(search.toLowerCase()));
    const matchCat = !filterCat || i.category === filterCat;
    return matchSearch && matchCat;
  });

  const cats = Array.from(new Set(items.map((i) => i.category ?? "other")));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Store className="w-6 h-6 text-violet-400" /> Creator Marketplace
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Install elite creator style packs — Dark Anime, Hormozi Captions, Cinematic MMA, Luxury Motivation and more
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packs..." className="w-full bg-muted/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterCat(null)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filterCat ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>All</button>
          {cats.map((cat) => {
            const meta = CAT_COLORS[cat] ?? CAT_COLORS.motivation;
            return (
              <button key={cat} onClick={() => setFilterCat(cat === filterCat ? null : cat)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${filterCat === cat ? `${meta.bg} ${meta.border} ${meta.color}` : "border-border text-muted-foreground hover:text-foreground"}`}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Item grid */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            [1,2,3,4,5].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center glass rounded-xl border border-border">
              <Store className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No packs found</p>
            </div>
          ) : (
            filtered.map((item) => {
              const meta = CAT_COLORS[item.category ?? "motivation"] ?? CAT_COLORS.motivation;
              const isInstalled = installed.includes(item.id);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected(item)}
                  className={`glass rounded-xl border p-4 cursor-pointer transition-all ${selected?.id === item.id ? `${meta.border} ${meta.bg}` : "border-border hover:border-primary/20"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0 text-lg font-black ${meta.color}`}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                        {isInstalled && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground capitalize">{item.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-foreground">{item.rating}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.downloads?.toLocaleString()} installs</span>
                        <span className="text-[10px] font-bold text-emerald-400 ml-auto">${item.price}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="py-20 text-center glass rounded-xl border border-border">
              <Store className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a pack to preview</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="glass rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-black text-foreground">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{selected.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-2xl font-black text-emerald-400">${selected.price}</p>
                      <p className="text-[10px] text-muted-foreground">one-time</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {[
                      ["Viral Score", `${selected.viralScore}%`, "text-emerald-400"],
                      ["Avg Retention", `${selected.avgRetention}%`, "text-primary"],
                      ["Rating", `${selected.rating}/5`, "text-yellow-400"],
                      ["Installs", `${selected.downloads?.toLocaleString()}`, "text-violet-400"],
                    ].map(([label, val, color]) => (
                      <div key={label} className="text-center p-2 rounded-lg bg-muted/30">
                        <p className={`text-sm font-black ${color}`}>{val}</p>
                        <p className="text-[9px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* DNA preview */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {DNA_PREVIEWS.map(({ key, label, icon: Icon, field }) => {
                      const dna = selected[key as keyof MarketplaceItem] as Record<string, unknown> | undefined;
                      return (
                        <div key={key} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
                            <p className="text-[11px] font-medium text-foreground truncate capitalize">
                              {String(dna?.[field] ?? "—").replace(/-/g, " ")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tags */}
                  {selected.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-muted/40 border border-border text-muted-foreground capitalize">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Example hooks */}
                  {selected.hookDNA && (selected.hookDNA as any).exampleHooks && (
                    <div className="mb-5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Example Hooks in This Style</p>
                      {((selected.hookDNA as any).exampleHooks as string[]).map((h, i) => (
                        <p key={i} className="text-xs text-foreground/80 italic mb-1.5 flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          "{h}"
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => install(selected)}
                    disabled={installing === selected.id || installed.includes(selected.id)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors ${
                      installed.includes(selected.id)
                        ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
                        : "bg-violet-500 text-white hover:bg-violet-400"
                    } disabled:opacity-60`}>
                    {installing === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : installed.includes(selected.id) ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {installed.includes(selected.id) ? "Installed" : installing === selected.id ? "Installing..." : `Install Pack — $${selected.price}`}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
