import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Brain, Eye, Zap, Target, Type, TrendingUp, Sparkles,
  Send, Activity, Cpu, Database, RefreshCw, CheckCircle,
  ChevronRight, Loader2, Radio, Wifi, AlertCircle, Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
  actionResult?: unknown;
}

interface AgentActivity {
  agent: string;
  message: string;
  timestamp: string;
  type?: "thinking" | "complete" | "error";
}

interface AgentNode {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  status: "idle" | "active" | "complete" | "error";
}

const INITIAL_AGENTS: AgentNode[] = [
  { id: "trend", name: "Trend", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", status: "idle" },
  { id: "hook", name: "Hook", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", status: "idle" },
  { id: "emotion", name: "Emotion", icon: Brain, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/30", status: "idle" },
  { id: "visual", name: "Visual", icon: Eye, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30", status: "idle" },
  { id: "retention", name: "Retention", icon: Activity, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", status: "idle" },
  { id: "caption", name: "Caption", icon: Type, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30", status: "idle" },
  { id: "virality", name: "Virality", icon: Target, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", status: "idle" },
  { id: "memory", name: "Memory", icon: Database, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", status: "idle" },
];

const QUICK_COMMANDS = [
  "Grow a dark motivation page from 0",
  "Analyze what's trending on TikTok right now",
  "Create hooks for a finance content niche",
  "Build a 30-day content strategy for fitness",
  "What makes a video go viral in 2025?",
  "Optimize my emotional pacing strategy",
];

export default function CommandCenter() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "JARVIS online. I'm your autonomous content intelligence system — coordinating 8 specialized AI agents to engineer viral content.\n\nTell me your goal and I'll activate the right agents, analyze trends, and build you a complete viral strategy. What are we creating today?",
      timestamp: new Date().toISOString(),
      suggestions: ["Grow a dark motivation page", "Scan today's trends", "Build a viral strategy"],
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [agents, setAgents] = useState<AgentNode[]>(INITIAL_AGENTS);
  const [activityFeed, setActivityFeed] = useState<AgentActivity[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelinePrompt, setPipelinePrompt] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activityEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activityFeed]);

  const addActivity = useCallback((activity: AgentActivity) => {
    setActivityFeed((prev) => [...prev.slice(-49), activity]);
  }, []);

  const updateAgentStatus = useCallback((agentName: string, status: AgentNode["status"]) => {
    setAgents((prev) => prev.map((a) =>
      agentName.toLowerCase().includes(a.id) ? { ...a, status } : a
    ));
  }, []);

  const resetAgents = useCallback(() => {
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a, status: "idle" })));
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setIsStreaming(true);

    addActivity({ agent: "JARVIS", message: "Processing command: " + text.slice(0, 60) + "...", timestamp: new Date().toISOString() });

    const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/agents/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });
      const data = await res.json();

      if (data.data) {
        const { reply, suggestions, agentActivity } = data.data;

        for (const log of (agentActivity ?? [])) {
          addActivity({ agent: log.agent, message: log.message, timestamp: log.timestamp });
          updateAgentStatus(log.agent, "active");
        }

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
          suggestions,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        setTimeout(resetAgents, 2000);
      }
    } catch {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "Connection interrupted. Reinitializing neural pathways...",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast({ title: "JARVIS connection failed", variant: "destructive" });
    } finally {
      setSending(false);
      setIsStreaming(false);
    }
  };

  const runPipeline = async () => {
    if (!pipelinePrompt.trim()) {
      toast({ title: "Enter a concept for the pipeline", variant: "destructive" });
      return;
    }

    setRunningPipeline(true);
    resetAgents();

    addActivity({ agent: "JARVIS", message: "Initiating full agent pipeline...", timestamp: new Date().toISOString() });

    const agentSequence = [
      { name: "trend", label: "Trend Agent" },
      { name: "hook", label: "Hook Agent" },
      { name: "emotion", label: "Emotion Agent" },
      { name: "visual", label: "Visual Director" },
      { name: "retention", label: "Retention Agent" },
      { name: "caption", label: "Caption Agent" },
      { name: "virality", label: "Virality Engine" },
      { name: "memory", label: "AI Memory" },
    ];

    let i = 0;
    const activateInterval = setInterval(() => {
      if (i < agentSequence.length) {
        const agent = agentSequence[i];
        setAgents((prev) => prev.map((a) => a.id === agent.name ? { ...a, status: "active" } : a));
        addActivity({
          agent: agent.label,
          message: `Agent activated — processing "${pipelinePrompt.slice(0, 40)}..."`,
          timestamp: new Date().toISOString(),
        });
        i++;
      } else {
        clearInterval(activateInterval);
      }
    }, 600);

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: pipelinePrompt, mode: "full_pipeline" }),
      });
      const result = await res.json();

      clearInterval(activateInterval);

      setAgents((prev) => prev.map((a) => ({ ...a, status: "complete" })));

      for (const log of (result.allLogs ?? [])) {
        addActivity({ agent: log.agent, message: log.message, timestamp: log.timestamp });
      }

      const viralScore = result.virality?.viral_probability ?? 0;
      const msg: ChatMessage = {
        role: "assistant",
        content: `Pipeline complete. Here's what I found:\n\n**Viral Probability: ${viralScore}%** — ${viralScore >= 75 ? "High viral potential detected." : viralScore >= 50 ? "Solid content, optimize the hook." : "Needs work on emotional pacing."}\n\n**Top Hook:** "${result.hooks?.topHook?.hook ?? "Generated in agent run"}"\n\n**Retention Score:** ${result.retention?.retentionScore ?? "—"}/100\n\nYour content is optimized. Check Agent Studio for full breakdown.`,
        timestamp: new Date().toISOString(),
        suggestions: ["View full results in Agent Studio", "Refine the hook variations", "Generate captions for this content"],
        actionResult: result,
      };
      setMessages((prev) => [...prev, msg]);

      setTimeout(() => {
        setAgents((prev) => prev.map((a) => ({ ...a, status: "idle" })));
      }, 3000);

      toast({ title: `Pipeline complete — ${viralScore}% viral probability` });
    } catch {
      clearInterval(activateInterval);
      resetAgents();
      toast({ title: "Pipeline failed", variant: "destructive" });
    } finally {
      setRunningPipeline(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="shrink-0 h-14 border-b border-border flex items-center px-6 gap-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground tracking-wide">JARVIS Command Center</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><Radio className="w-2.5 h-2.5" /> All 8 agents online</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isStreaming && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[10px] text-primary">
              <Wifi className="w-3 h-3 animate-pulse" /> Processing...
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Agent Status Board */}
        <div className="w-52 shrink-0 border-r border-border flex flex-col bg-sidebar overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Agent Nodes</p>
          </div>
          <div className="flex-1 p-3 space-y-1.5">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.id}
                  animate={agent.status === "active" ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all ${
                    agent.status === "active"
                      ? `${agent.bg} ${agent.border} shadow-sm`
                      : agent.status === "complete"
                      ? "bg-emerald-400/5 border-emerald-400/20"
                      : "border-transparent"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${agent.bg}`}>
                    <Icon className={`w-3 h-3 ${agent.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                  </div>
                  <div className="shrink-0">
                    {agent.status === "active" && <Loader2 className={`w-2.5 h-2.5 ${agent.color} animate-spin`} />}
                    {agent.status === "complete" && <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />}
                    {agent.status === "error" && <AlertCircle className="w-2.5 h-2.5 text-red-400" />}
                    {agent.status === "idle" && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Pipeline */}
          <div className="p-3 border-t border-border space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Quick Pipeline</p>
            <input
              value={pipelinePrompt}
              onChange={(e) => setPipelinePrompt(e.target.value)}
              placeholder="Enter concept..."
              className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={runPipeline}
              disabled={runningPipeline || !pipelinePrompt.trim()}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {runningPipeline ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {runningPipeline ? "Running..." : "Run All Agents"}
            </button>
          </div>
        </div>

        {/* Center: JARVIS Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "glass border border-border rounded-bl-sm text-foreground"
                    }`}>
                      {msg.content.split("\n").map((line, li) => {
                        const bold = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
                        return <p key={li} className={li > 0 ? "mt-1" : ""} dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
                      })}
                    </div>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s, si) => (
                          <button
                            key={si}
                            onClick={() => sendMessage(s)}
                            className="text-[10px] px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] text-muted-foreground px-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground">U</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {sending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" />
                </div>
                <div className="glass border border-border rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick commands */}
          <div className="shrink-0 px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {QUICK_COMMANDS.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(cmd)}
                  className="shrink-0 text-[10px] px-3 py-1.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors whitespace-nowrap"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border p-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Give JARVIS a command... (Enter to send)"
                rows={2}
                className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={sending || !input.trim()}
                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Activity Feed */}
        <div className="w-64 shrink-0 border-l border-border flex flex-col bg-sidebar">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Live Feed</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence>
              {activityFeed.length === 0 ? (
                <div className="py-8 text-center">
                  <Activity className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground">Agents standing by...</p>
                </div>
              ) : (
                [...activityFeed].reverse().map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <p className="text-[10px] font-semibold text-primary mb-0.5">{activity.agent}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{activity.message}</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={activityEndRef} />
          </div>

          {activityFeed.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => setActivityFeed([])}
                className="w-full text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Clear feed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
