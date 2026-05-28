import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Loader2, Zap, ShoppingBag, Link2, Shirt, TrendingUp,
  ArrowRight, ChevronRight, Sparkles, Star, Target, Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SponsorshipOpp { brand: string; type: string; estimatedRate: string; fit: string; }
interface DigitalProduct { name: string; format: string; estimatedRevenue: string; difficulty: string; }
interface AffiliateOffer { product: string; commission: string; fit: string; }
interface MerchConcept { name: string; type: string; emotion: string; }
interface FunnelStrategy { topOfFunnel: string; middle: string; conversion: string; estimatedMonthly: string; }

interface MonetizationResult {
  sponsorshipOpportunities: SponsorshipOpp[];
  digitalProducts: DigitalProduct[];
  affiliateOffers: AffiliateOffer[];
  merchConcepts: MerchConcept[];
  funnelStrategy: FunnelStrategy;
  totalRevenueEstimate: string;
  priorityActions: string[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  high: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function Monetization() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    niche: "",
    platform: "tiktok",
    audienceSize: "10K-50K",
    avgViews: "5K-20K",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MonetizationResult | null>(null);
  const [activeSection, setActiveSection] = useState<"sponsorships" | "digital" | "affiliate" | "merch" | "funnel">("sponsorships");

  const analyze = async () => {
    if (!form.niche.trim()) { toast({ title: "Enter your niche", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/monetization/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data.data ?? data);
      setActiveSection("sponsorships");
      toast({ title: `Monetization strategy built — ${data.data?.totalRevenueEstimate ?? data.totalRevenueEstimate} potential` });
    } catch { toast({ title: "Analysis failed", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const SECTIONS = [
    { id: "sponsorships", label: "Sponsorships", icon: Star, count: result?.sponsorshipOpportunities?.length },
    { id: "digital", label: "Digital Products", icon: ShoppingBag, count: result?.digitalProducts?.length },
    { id: "affiliate", label: "Affiliate", icon: Link2, count: result?.affiliateOffers?.length },
    { id: "merch", label: "Merch", icon: Shirt, count: result?.merchConcepts?.length },
    { id: "funnel", label: "Funnel", icon: Target, count: null },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-400" /> Monetization Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-powered revenue strategy — sponsorships, digital products, affiliate, merch, and funnel</p>
      </div>

      {/* Input form */}
      <div className="glass rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Build Revenue Strategy
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Your Niche</label>
            <input value={form.niche} onChange={(e) => setForm((p) => ({ ...p, niche: e.target.value }))}
              placeholder="dark motivation, finance, fitness, gaming..."
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Platform</label>
            <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
              {["tiktok", "youtube", "instagram", "twitter"].map((pl) => <option key={pl} value={pl}>{pl}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Audience Size</label>
            <select value={form.audienceSize} onChange={(e) => setForm((p) => ({ ...p, audienceSize: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
              {["0-1K", "1K-10K", "10K-50K", "50K-100K", "100K-500K", "500K+"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Avg Views / Video</label>
            <select value={form.avgViews} onChange={(e) => setForm((p) => ({ ...p, avgViews: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50">
              {["Under 1K", "1K-5K", "5K-20K", "20K-100K", "100K-500K", "500K+"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button onClick={analyze} disabled={loading || !form.niche.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-500/90 transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
          {loading ? "Building strategy..." : "Generate Revenue Strategy"}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Revenue estimate hero */}
            <div className="glass rounded-xl border border-emerald-400/30 p-6 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Estimated Revenue Potential</p>
              <p className="text-5xl font-black text-emerald-400">{result.totalRevenueEstimate}</p>
              <p className="text-sm text-muted-foreground mt-1">per month — with full strategy execution</p>

              {result.priorityActions && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {result.priorityActions.map((action, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-400">
                      <ArrowRight className="w-3 h-3" />{action}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section tabs */}
            <div className="flex gap-1 border-b border-border overflow-x-auto">
              {SECTIONS.map(({ id, label, icon: Icon, count }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0 ${activeSection === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                  {count != null && <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5 py-0.5">{count}</span>}
                </button>
              ))}
            </div>

            {/* Sponsorships */}
            {activeSection === "sponsorships" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sponsorshipOpportunities?.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.brand}</p>
                        <p className="text-xs text-muted-foreground">{s.type}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">{s.estimatedRate}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.fit}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Digital products */}
            {activeSection === "digital" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.digitalProducts?.map((d, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{d.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.format}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">{d.estimatedRevenue}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${DIFFICULTY_COLORS[d.difficulty] ?? DIFFICULTY_COLORS.medium}`}>
                          {d.difficulty}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Affiliate */}
            {activeSection === "affiliate" && (
              <div className="space-y-3">
                {result.affiliateOffers?.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Link2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.product}</p>
                      <p className="text-xs text-muted-foreground">{a.fit}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 shrink-0">{a.commission} commission</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Merch */}
            {activeSection === "merch" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.merchConcepts?.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl border border-border p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                      <Shirt className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{m.type}</p>
                    <p className="text-xs text-primary mt-2">{m.emotion}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Funnel */}
            {activeSection === "funnel" && result.funnelStrategy && (
              <div className="space-y-4">
                <div className="glass rounded-xl border border-emerald-400/20 p-5 text-center mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Funnel Revenue Potential</p>
                  <p className="text-3xl font-black text-emerald-400">{result.funnelStrategy.estimatedMonthly}</p>
                </div>
                {[
                  { label: "Top of Funnel (Awareness)", value: result.funnelStrategy.topOfFunnel, color: "text-primary", icon: Users },
                  { label: "Middle of Funnel (Nurture)", value: result.funnelStrategy.middle, color: "text-yellow-400", icon: TrendingUp },
                  { label: "Conversion (Revenue)", value: result.funnelStrategy.conversion, color: "text-emerald-400", icon: DollarSign },
                ].map(({ label, value, color, icon: Icon }, i) => (
                  <div key={i} className="glass rounded-xl border border-border p-4 flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${color} mb-1`}>{label}</p>
                      <p className="text-sm text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
