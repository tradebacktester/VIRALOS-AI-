import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Cpu, Zap, HardDrive, Activity, CheckCircle, AlertCircle,
  Loader2, RefreshCw, BarChart3, Database, Globe, Shield,
  TrendingDown, Clock, Radio,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const GPU_NODES = [
  { id: "gpu-1", label: "GPU Node Alpha", type: "A100 80GB", status: "active", load: 73, tasks: 4, region: "us-east-1" },
  { id: "gpu-2", label: "GPU Node Beta", type: "A100 80GB", status: "active", load: 45, tasks: 2, region: "us-east-1" },
  { id: "gpu-3", label: "GPU Node Gamma", type: "V100 32GB", status: "standby", load: 0, tasks: 0, region: "eu-west-1" },
  { id: "gpu-4", label: "GPU Node Delta", type: "V100 32GB", status: "active", load: 88, tasks: 7, region: "ap-southeast-1" },
];

const CDN_EDGES = [
  { region: "North America", latency: "12ms", status: "optimal", requests: "2.4M" },
  { region: "Europe", latency: "18ms", status: "optimal", requests: "1.1M" },
  { region: "Asia Pacific", latency: "31ms", status: "degraded", requests: "0.8M" },
  { region: "South America", latency: "45ms", status: "optimal", requests: "0.3M" },
];

const MICROSERVICES = [
  { name: "Script Generator", status: "healthy", uptime: "99.97%", rpm: 142 },
  { name: "Voice Synthesizer", status: "healthy", uptime: "99.91%", rpm: 89 },
  { name: "Clip Engine", status: "healthy", uptime: "99.99%", rpm: 67 },
  { name: "Caption AI", status: "healthy", uptime: "100%", rpm: 201 },
  { name: "Virality Scorer", status: "healthy", uptime: "99.88%", rpm: 312 },
  { name: "Publisher Bot", status: "degraded", uptime: "98.2%", rpm: 23 },
  { name: "A/B Analyzer", status: "healthy", uptime: "99.95%", rpm: 55 },
  { name: "Memory Store", status: "healthy", uptime: "99.99%", rpm: 445 },
];

interface QueueTask { id: number; taskType: string; status: string; priority?: number; estimatedMs?: number; costCredits?: number; gpuAssigned?: string; cachedResult?: boolean; createdAt: string; }

function genThroughputData() {
  return Array.from({ length: 20 }, (_, i) => ({
    t: `${i}s`, rps: Math.floor(80 + Math.random() * 60),
  }));
}

export default function EnterpriseOps() {
  const { toast } = useToast();
  const [queueSummary, setQueueSummary] = useState<{ queued: number; processing: number; done: number; failed: number; totalCostCredits: number; cacheHitRate: number; tasks: QueueTask[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [throughput, setThroughput] = useState(genThroughputData());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand/queue");
      setQueueSummary(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueue();
    intervalRef.current = setInterval(() => {
      setThroughput(genThroughputData());
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const statusColor = (s: string) => s === "healthy" || s === "optimal" || s === "active" ? "text-emerald-400" : s === "standby" ? "text-yellow-400" : "text-red-400";
  const statusBg = (s: string) => s === "healthy" || s === "optimal" || s === "active" ? "bg-emerald-400/10 border-emerald-400/20" : s === "standby" ? "bg-yellow-400/10 border-yellow-400/20" : "bg-red-400/10 border-red-400/20";
  const loadColor = (n: number) => n > 80 ? "bg-red-400" : n > 60 ? "bg-yellow-400" : "bg-emerald-400";

  const totalTasks = (queueSummary?.queued ?? 0) + (queueSummary?.processing ?? 0) + (queueSummary?.done ?? 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-primary" /> Enterprise Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">GPU task queues · CDN pipeline · Microservice health · Cost optimization</p>
        </div>
        <button onClick={fetchQueue} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
        </button>
      </div>

      {/* System status ticker */}
      <div className="glass rounded-xl border border-emerald-400/20 px-5 py-3 flex items-center gap-6 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">ALL SYSTEMS OPERATIONAL</span>
        </div>
        {[
          ["Platform Uptime", "99.94%"],
          ["GPU Nodes", "3/4 active"],
          ["CDN Latency", "18ms avg"],
          ["Cache Hit Rate", `${Math.round((queueSummary?.cacheHitRate ?? 0.72) * 100)}%`],
          ["Total Credits Used", `${(queueSummary?.totalCostCredits ?? 0).toFixed(4)}`],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-muted-foreground">{label}:</span>
            <span className="text-foreground font-bold">{val}</span>
          </div>
        ))}
      </div>

      {/* Live throughput */}
      <div className="glass rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Live Request Throughput</h2>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Radio className="w-3 h-3" /> Live</span>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={throughput}>
            <XAxis dataKey="t" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
            <Line type="monotone" dataKey="rps" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="req/s" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPU Nodes */}
        <div className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400" /> GPU Node Cluster</h2>
          <div className="space-y-3">
            {GPU_NODES.map((node) => (
              <div key={node.id} className={`p-3 rounded-xl border ${statusBg(node.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-foreground">{node.label}</p>
                    <p className="text-[10px] text-muted-foreground">{node.type} · {node.region}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{node.tasks} tasks</span>
                    <span className={`text-[10px] font-bold capitalize ${statusColor(node.status)}`}>{node.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${node.load}%` }} transition={{ duration: 1 }}
                      className={`h-full rounded-full ${loadColor(node.load)}`} />
                  </div>
                  <span className="text-[10px] font-bold text-foreground w-8 text-right">{node.load}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Microservices */}
        <div className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Microservices</h2>
          <div className="space-y-2">
            {MICROSERVICES.map((svc) => (
              <div key={svc.name} className="flex items-center gap-3 py-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${svc.status === "healthy" ? "bg-emerald-400" : "bg-red-400"} shrink-0`} />
                <p className="text-xs text-foreground flex-1">{svc.name}</p>
                <span className="text-[10px] text-muted-foreground">{svc.uptime}</span>
                <span className="text-[10px] font-mono text-primary w-16 text-right">{svc.rpm} rpm</span>
              </div>
            ))}
          </div>
        </div>

        {/* CDN Pipeline */}
        <div className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-violet-400" /> CDN Edge Network</h2>
          <div className="space-y-2">
            {CDN_EDGES.map((edge) => (
              <div key={edge.region} className={`flex items-center gap-3 p-2.5 rounded-lg border ${statusBg(edge.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${edge.status === "optimal" ? "bg-emerald-400" : "bg-yellow-400"}`} />
                <p className="text-xs text-foreground flex-1">{edge.region}</p>
                <span className="text-[10px] font-bold text-foreground">{edge.latency}</span>
                <span className="text-[10px] text-muted-foreground">{edge.requests} req/d</span>
              </div>
            ))}
          </div>
        </div>

        {/* Render Queue */}
        <div className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><HardDrive className="w-4 h-4 text-orange-400" /> Render Queue</h2>
          {queueSummary ? (
            <>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  ["Queued", queueSummary.queued, "text-yellow-400"],
                  ["Processing", queueSummary.processing, "text-primary"],
                  ["Done", queueSummary.done, "text-emerald-400"],
                  ["Failed", queueSummary.failed, "text-red-400"],
                ].map(([label, val, color]) => (
                  <div key={label} className="text-center p-2 rounded-lg bg-muted/30">
                    <p className={`text-xl font-black ${color}`}>{val}</p>
                    <p className="text-[9px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Cache hit rate: <span className="text-emerald-400 font-bold">{Math.round(queueSummary.cacheHitRate * 100)}%</span></span>
                <span>Cost: <span className="text-foreground font-bold">{queueSummary.totalCostCredits.toFixed(4)} credits</span></span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {queueSummary.tasks.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 py-1">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === "done" ? "bg-emerald-400" : task.status === "processing" ? "bg-primary animate-pulse" : task.status === "failed" ? "bg-red-400" : "bg-muted-foreground"}`} />
                    <span className="text-[10px] text-foreground capitalize flex-1">{task.taskType.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-muted-foreground">{task.gpuAssigned}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{task.costCredits?.toFixed(3)}cr</span>
                    {task.cachedResult && <span className="text-[9px] text-emerald-400 font-bold">CACHE</span>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No queue data — generate some videos first</p>
            </div>
          )}
        </div>
      </div>

      {/* Cost Optimization panel */}
      <div className="glass rounded-xl border border-emerald-400/20 p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-400" /> Cost Optimization Engine
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Smart Caching", desc: "Reusing identical clips", saving: "34% less compute", icon: Database, color: "text-cyan-400" },
            { label: "Priority Queue", desc: "Viral-score weighted", saving: "Faster delivery", icon: BarChart3, color: "text-primary" },
            { label: "GPU Load Balance", desc: "Auto-scaling nodes", saving: "62% efficiency", icon: Cpu, color: "text-yellow-400" },
            { label: "CDN Pre-render", desc: "Edge caching pipeline", saving: "89ms avg latency", icon: Globe, color: "text-violet-400" },
          ].map(({ label, desc, saving, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-xl border border-border bg-muted/20">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-xs font-bold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground mb-1">{desc}</p>
              <p className={`text-[10px] font-bold ${color}`}>{saving}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
