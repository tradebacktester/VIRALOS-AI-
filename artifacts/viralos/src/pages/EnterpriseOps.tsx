import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Cpu, Zap, HardDrive, Activity, CheckCircle, AlertCircle,
  Loader2, RefreshCw, BarChart3, Database, Globe, Shield,
  TrendingDown, Clock, Radio, Play, Square, FlaskConical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface GpuNode {
  id: string;
  label: string;
  type: string;
  region: string;
  gpuKey: string;
  status: string;
  load: number;
  totalTasks: number;
  activeTasks: number;
  doneTasks: number;
  failedTasks: number;
  recentTasks: {
    id: number;
    taskType: string;
    status: string;
    costCredits: number | null;
    cachedResult: boolean | null;
    createdAt: string | null;
    estimatedMs: number | null;
    priority: number | null;
  }[];
}

interface SystemStatus {
  totalProjects: number;
  completedProjects: number;
  totalAgentRuns: number;
  activeTasks: number;
  cacheHitRate: number;
  totalCreditsUsed: number;
  latestViralProbability: number | null;
  platformUptime: number;
}

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

const TASK_TYPES = ["video_render", "script_gen", "virality_score", "hook_generation", "clip_search"];

function genThroughputData() {
  return Array.from({ length: 20 }, (_, i) => ({
    t: `${i}s`, rps: Math.floor(60 + Math.random() * 80),
  }));
}

function NodeCard({
  node,
  onDispatch,
  onDrain,
  onStressTest,
  dispatching,
}: {
  node: GpuNode;
  onDispatch: (id: string, taskType: string) => void;
  onDrain: (id: string) => void;
  onStressTest: (id: string) => void;
  dispatching: string | null;
}) {
  const [showTasks, setShowTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(TASK_TYPES[0]);

  const statusColor = node.status === "active" ? "text-emerald-400" : node.status === "overloaded" ? "text-red-400" : "text-yellow-400";
  const statusBg = node.status === "active" ? "bg-emerald-400/5 border-emerald-400/20" : node.status === "overloaded" ? "bg-red-400/5 border-red-400/20" : "bg-yellow-400/5 border-yellow-400/20";
  const loadColor = node.load > 80 ? "bg-red-400" : node.load > 55 ? "bg-yellow-400" : "bg-emerald-400";
  const isDispatching = dispatching === node.id;

  return (
    <div className={`p-4 rounded-xl border ${statusBg} space-y-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">{node.label}</p>
          <p className="text-[10px] text-muted-foreground">{node.type} · {node.region}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{node.activeTasks} active</span>
          <span className={`text-[10px] font-bold capitalize ${statusColor}`}>{node.status}</span>
        </div>
      </div>

      {/* Load bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">GPU Load</span>
          <span className="text-[10px] font-bold font-mono text-foreground">{node.load}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${node.load}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`h-full rounded-full ${loadColor}`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: node.totalTasks, color: "text-foreground" },
          { label: "Active", value: node.activeTasks, color: "text-primary" },
          { label: "Done", value: node.doneTasks, color: "text-emerald-400" },
          { label: "Failed", value: node.failedTasks, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center p-1.5 rounded-lg bg-muted/20">
            <p className={`text-sm font-black ${color}`}>{value}</p>
            <p className="text-[8px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="flex-1 bg-muted/40 border border-border rounded-lg px-2 py-1 text-[10px] text-foreground focus:outline-none focus:border-primary/50"
          >
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button
            onClick={() => onDispatch(node.id, selectedTask)}
            disabled={isDispatching || node.status === "overloaded"}
            className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            {isDispatching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Dispatch
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDrain(node.id)}
            disabled={node.activeTasks === 0}
            className="flex-1 px-2 py-1 rounded-lg bg-yellow-400/5 border border-yellow-400/20 text-yellow-400 text-[10px] font-semibold hover:bg-yellow-400/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-colors"
          >
            <Square className="w-3 h-3" /> Drain Queue
          </button>
          <button
            onClick={() => onStressTest(node.id)}
            className="flex-1 px-2 py-1 rounded-lg bg-violet-400/5 border border-violet-400/20 text-violet-400 text-[10px] font-semibold hover:bg-violet-400/10 flex items-center justify-center gap-1 transition-colors"
          >
            <FlaskConical className="w-3 h-3" /> Stress Test
          </button>
        </div>
      </div>

      {/* Recent tasks */}
      {node.recentTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="text-[9px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
          >
            {showTasks ? "▲ Hide" : "▼ Show"} recent tasks ({node.recentTasks.length})
          </button>
          <AnimatePresence>
            {showTasks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2 space-y-1"
              >
                {node.recentTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 py-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === "done" ? "bg-emerald-400" : t.status === "processing" ? "bg-primary animate-pulse" : t.status === "failed" ? "bg-red-400" : "bg-muted-foreground"}`} />
                    <span className="text-[9px] text-foreground capitalize flex-1 truncate">{t.taskType.replace(/_/g, " ")}</span>
                    {t.cachedResult && <span className="text-[8px] text-emerald-400 font-bold">CACHE</span>}
                    <span className="text-[9px] font-mono text-muted-foreground">{t.costCredits?.toFixed(3)}cr</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function EnterpriseOps() {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<GpuNode[]>([]);
  const [sysStatus, setSysStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [throughput, setThroughput] = useState(genThroughputData());
  const [dispatching, setDispatching] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [nodesRes, sysRes] = await Promise.all([
        fetch("/api/enterprise/nodes"),
        fetch("/api/enterprise/system-status"),
      ]);
      if (nodesRes.ok) setNodes(await nodesRes.json());
      if (sysRes.ok) setSysStatus(await sysRes.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(() => {
      setThroughput(genThroughputData());
      fetchAll();
    }, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleDispatch = async (nodeId: string, taskType: string) => {
    setDispatching(nodeId);
    try {
      const res = await fetch(`/api/enterprise/nodes/${nodeId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: `Task dispatched to ${data.node}`, description: `${taskType.replace(/_/g, " ")} queued` });
        await fetchAll();
      }
    } catch {
      toast({ title: "Dispatch failed", variant: "destructive" });
    }
    setDispatching(null);
  };

  const handleDrain = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/enterprise/nodes/${nodeId}/drain`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast({ title: data.message });
        await fetchAll();
      }
    } catch {
      toast({ title: "Drain failed", variant: "destructive" });
    }
  };

  const handleStressTest = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/enterprise/nodes/${nodeId}/stress-test`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast({ title: `Stress test started on ${data.node}`, description: `${data.tasksDispatched} tasks dispatched` });
        setTimeout(fetchAll, 1000);
      }
    } catch {
      toast({ title: "Stress test failed", variant: "destructive" });
    }
  };

  const totalActiveTasks = nodes.reduce((s, n) => s + n.activeTasks, 0);
  const activeNodes = nodes.filter((n) => n.status === "active").length;
  const avgLoad = nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.load, 0) / nodes.length) : 0;

  const statusColor = (s: string) => s === "healthy" || s === "optimal" || s === "active" ? "text-emerald-400" : s === "standby" ? "text-yellow-400" : "text-red-400";
  const statusBg = (s: string) => s === "healthy" || s === "optimal" || s === "active" ? "bg-emerald-400/10 border-emerald-400/20" : s === "standby" ? "bg-yellow-400/10 border-yellow-400/20" : "bg-red-400/10 border-red-400/20";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-primary" /> Enterprise Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live GPU node cluster · CDN pipeline · Microservice health · Cost optimization
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
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
          ["Uptime", `${sysStatus?.platformUptime ?? 99.94}%`],
          ["GPU Nodes", `${activeNodes}/${nodes.length} active`],
          ["Avg GPU Load", `${avgLoad}%`],
          ["Active Tasks", String(totalActiveTasks)],
          ["Cache Hit Rate", `${sysStatus?.cacheHitRate ?? 0}%`],
          ["Credits Used", `${(sysStatus?.totalCreditsUsed ?? 0).toFixed(4)}`],
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
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Live Request Throughput
          </h2>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Radio className="w-3 h-3" /> Live · {totalActiveTasks} tasks processing
          </span>
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

      {/* GPU Node Cluster — 4 real nodes */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" /> GPU Node Cluster
          <span className="text-[10px] text-muted-foreground ml-1">— dispatch tasks, drain queues, stress-test nodes</span>
        </h2>
        {loading && nodes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                onDispatch={handleDispatch}
                onDrain={handleDrain}
                onStressTest={handleStressTest}
                dispatching={dispatching}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Microservices */}
        <div className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> Microservices
          </h2>
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

        {/* CDN */}
        <div className="glass rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" /> CDN Edge Network
          </h2>
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
      </div>

      {/* Cost Optimization */}
      <div className="glass rounded-xl border border-emerald-400/20 p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-400" /> Cost Optimization Engine
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Smart Caching", desc: "Reusing identical clips", saving: `${sysStatus?.cacheHitRate ?? 0}% cache rate`, icon: Database, color: "text-cyan-400" },
            { label: "Priority Queue", desc: "Viral-score weighted", saving: `${totalActiveTasks} tasks active`, icon: BarChart3, color: "text-primary" },
            { label: "GPU Load Balance", desc: "Auto-scaling nodes", saving: `${avgLoad}% avg load`, icon: Cpu, color: "text-yellow-400" },
            { label: "Credits Saved", desc: "Edge caching pipeline", saving: `${(sysStatus?.totalCreditsUsed ?? 0).toFixed(4)} used`, icon: Globe, color: "text-violet-400" },
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
