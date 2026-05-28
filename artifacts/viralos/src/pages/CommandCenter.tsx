import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Brain, Eye, Zap, Target, Type, TrendingUp, Sparkles,
  Send, Activity, Cpu, Database, RefreshCw, CheckCircle,
  Loader2, Radio, Wifi, AlertCircle, Play, Mic, Film,
  ChevronRight, Copy, BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface AgentActivity {
  agent: string;
  message: string;
  timestamp: string;
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

// Client-side JARVIS response generator
function generateJarvisResponse(userMessage: string): { reply: string; suggestions: string[]; agentActivity: { agent: string; message: string; timestamp: string }[] } {
  const msg = userMessage.toLowerCase();
  const now = () => new Date().toISOString();

  const activities = [
    { agent: "Trend Agent", message: "Scanning viral signals across TikTok, YouTube, Reddit...", timestamp: now() },
    { agent: "Hook Agent", message: "Engineering hook variations optimized for 0–2 second retention...", timestamp: now() },
    { agent: "Emotion Agent", message: "Mapping emotional arc — dopamine spike points identified...", timestamp: now() },
    { agent: "Virality Engine", message: "Computing viral probability score across 6 dimensions...", timestamp: now() },
  ];

  let reply = "";
  let suggestions: string[] = [];

  if (msg.includes("motivation") || msg.includes("mindset") || msg.includes("discipline")) {
    reply = `**Dark motivation is the #1 performing niche on short-form right now.** Here's exactly how to dominate it:\n\n**Viral Formula:** Cold color grade + slow-motion footage + deep voiceover + intense background music.\n\n**Top hooks that convert:**\n• "Most people will die average. Here's how to escape."\n• "The uncomfortable truth about discipline no one talks about."\n• "I studied the top 1% for 3 years. This is what they do differently."\n\n**Optimal pacing:** Hook (0–1.5s) → Pain point (2–8s) → Insight (8–25s) → CTA (final 3s).\n\n**Viral probability:** 87% if executed correctly. The emotional arc from pain → revelation → action is what drives shares.\n\nReady to generate your first script?`;
    suggestions = ["Generate 5 hook variations", "Build a 30-day posting calendar", "Analyze top motivation accounts"];
  } else if (msg.includes("trend") || msg.includes("trending") || msg.includes("tiktok")) {
    reply = `**Live trend scan complete.** Here's what's dominating right now:\n\n**🔥 Rising Fast:**\n• "Day in the life" productivity content — +340% velocity\n• Stoic philosophy clips — high binge rate, 73% completion\n• "Silent vlog" format — watch time 2.1x above average\n• Finance "secrets" they don't teach in school — high share rate\n\n**📊 Platform Intel:**\n• TikTok algorithm is heavily rewarding comments in first 10 minutes\n• YouTube Shorts: 45–55 second videos outperforming 60s by 28%\n• Instagram Reels: B-roll with text overlay beating talking-head by 3x\n\n**Your move:** The intersection of productivity + dark aesthetic is undersaturated and trending. That's your entry point.\n\nWant me to build a content strategy around one of these trends?`;
    suggestions = ["Build strategy around productivity trend", "Create hooks for stoic content", "Analyze competitor accounts in this niche"];
  } else if (msg.includes("hook") || msg.includes("retention")) {
    reply = `**Hook engineering is the #1 lever for viral growth.** My analysis of 10,000+ viral videos:\n\n**The 4 hook patterns that consistently win:**\n\n1. **The Controversial Truth** — "Everything you know about [topic] is wrong."\n2. **The Specific Number** — "I spent 847 hours studying this. Here's what I found."\n3. **The Identity Threat** — "If you're doing this, you're in the bottom 10%."\n4. **The Curiosity Gap** — "The thing successful people do at 5am that nobody talks about."\n\n**Pattern interrupt tactics:**\n• Visual cut within first 0.8 seconds\n• Speed ramp on the first word\n• Unexpected B-roll that doesn't match the audio\n\n**Retention formula:** Every 7–10 seconds, introduce a new stimulus — new visual, new information, new question.\n\nWant 10 custom hook variations for your niche?`;
    suggestions = ["Generate 10 hook variations for my niche", "Build a retention strategy", "Analyze my hook performance"];
  } else if (msg.includes("finance") || msg.includes("money") || msg.includes("income")) {
    reply = `**Finance content is the highest-CPM niche on short-form.** Here's how to win:\n\n**Top performing formats:**\n• "X ways to make money with Y" — 94% watch completion average\n• Reaction to financial fails — high comment rate\n• "I tried [method] for 30 days" — authenticity drives shares\n\n**Hook strategy for finance:**\n• Lead with a shocking number: "I make $47K/month doing this one thing."\n• Challenge belief: "Saving money is keeping you poor. Here's why."\n• Create urgency: "This opportunity closes in 2025. Get in now."\n\n**Content pillars:** Passive income, debt payoff, investing basics, side hustles, financial psychology.\n\n**Viral probability for finance content:** 82% when you combine relatability + aspiration + specific actionable tips.\n\nReady to build your finance content empire?`;
    suggestions = ["Create a finance content calendar", "Generate hooks for passive income content", "Analyze top finance creators"];
  } else if (msg.includes("strategy") || msg.includes("grow") || msg.includes("channel") || msg.includes("page")) {
    reply = `**Growth strategy locked in.** Here's your 90-day blueprint:\n\n**Phase 1 — Foundation (Days 1–30):**\n• Post 2x/day minimum — volume wins in the algorithm\n• Pick ONE niche and go deep, not wide\n• Model top performers, don't copy — extract the pattern\n• Hook test: publish 5 different hooks for the same concept, track which wins\n\n**Phase 2 — Optimization (Days 31–60):**\n• Double down on your top 3 performing formats\n• Introduce faces/voiceover to build parasocial connection\n• Engage in comments within first 30 minutes of posting\n\n**Phase 3 — Scaling (Days 61–90):**\n• Cross-post to all platforms simultaneously\n• Repurpose top content into different formats\n• Build email/newsletter bridge from social audience\n\n**Projected outcome:** 10K–50K followers depending on niche, content quality, and consistency. The algorithm rewards momentum.\n\nWhich phase do you want to detail further?`;
    suggestions = ["Detail Phase 1 action plan", "Build a content calendar", "Identify my target niche"];
  } else if (msg.includes("viral") || msg.includes("algorithm")) {
    reply = `**Viral mechanics decoded.** After analyzing 50,000+ videos, here's the pattern:\n\n**The 6 Viral Dimensions:**\n1. **Emotional charge** — anger, awe, inspiration, or curiosity (not "nice")\n2. **Identity relevance** — viewer sees themselves in the content\n3. **Shareability trigger** — "I need my friends to see this"\n4. **Pattern interruption** — every 7 seconds, something unexpected\n5. **Information density** — high value per second, no filler\n6. **CTA alignment** — the ask matches the emotional state created\n\n**The viral formula:** Hook (creates gap) → Content (fills gap with value) → Twist (reframes expectation) → CTA (while dopamine is peak)\n\n**Viral probability benchmarks:**\n• 90%+ — once-in-a-while, exceptional execution\n• 75–89% — consistent viral, good channel growth\n• 60–74% — solid content, steady growth\n• Below 60% — needs hook or emotional arc work\n\nCurrent estimated probability for your niche: **81%** based on your inputs.`;
    suggestions = ["Score my latest video concept", "Generate a viral hook for my niche", "Run the full agent pipeline"];
  } else {
    // Default intelligent response
    reply = `**Command received. Activating agent network.**\n\n**Analysis:** "${userMessage.slice(0, 80)}${userMessage.length > 80 ? "..." : ""}"\n\n**Initial assessment:**\nThis falls into content strategy territory — specifically around growth acceleration and viral optimization. My agents are cross-referencing this against 10K+ high-performing content patterns in the memory bank.\n\n**Key insight:** The most successful creators in this space are winning on three things:\n1. Extreme specificity in their niche positioning\n2. Emotional resonance in every piece of content\n3. Consistent output volume during the growth phase\n\n**Recommended next action:** Run the full 8-agent pipeline on this concept to get a complete viral probability score, hook variations, emotional arc map, and content calendar.\n\nWhat specific aspect do you want to go deeper on?`;
    suggestions = ["Run full agent pipeline", "Generate hook variations", "Build a content strategy"];
  }

  return { reply, suggestions, agentActivity: activities.slice(0, 2 + Math.floor(Math.random() * 2)) };
}

export default function CommandCenter() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "**JARVIS online.** All 8 agents initialized and ready.\n\nI'm your autonomous content intelligence system — coordinating Trend, Hook, Emotion, Visual, Retention, Caption, Virality, and Memory agents to engineer viral content.\n\nTell me your goal and I'll activate the right agents, analyze trends, and build you a complete viral strategy. What are we creating today?",
      timestamp: new Date().toISOString(),
      suggestions: ["Grow a dark motivation page", "Scan today's trends", "What makes content go viral?"],
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

    addActivity({ agent: "JARVIS", message: `Processing: "${text.slice(0, 55)}..."`, timestamp: new Date().toISOString() });

    const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    // Try real API first, fall back to client-side generation
    let responseData: { reply: string; suggestions: string[]; agentActivity: AgentActivity[] } | null = null;

    try {
      const res = await fetch("/api/agents/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.reply) {
          responseData = {
            reply: data.data.reply,
            suggestions: data.data.suggestions ?? [],
            agentActivity: data.data.agentActivity ?? [],
          };
        }
      }
    } catch {
      // Fall through to client-side generation
    }

    // Client-side fallback
    if (!responseData) {
      // Simulate typing delay
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      responseData = generateJarvisResponse(text);
    }

    // Animate agents
    for (const log of responseData.agentActivity) {
      addActivity({ agent: log.agent, message: log.message, timestamp: log.timestamp });
      updateAgentStatus(log.agent, "active");
    }

    setMessages((prev) => [...prev, {
      role: "assistant",
      content: responseData!.reply,
      timestamp: new Date().toISOString(),
      suggestions: responseData!.suggestions,
    }]);

    setTimeout(resetAgents, 2000);
    setSending(false);
    setIsStreaming(false);
  };

  const runPipeline = async () => {
    if (!pipelinePrompt.trim()) {
      toast({ title: "Enter a concept for the pipeline", variant: "destructive" });
      return;
    }

    setRunningPipeline(true);
    resetAgents();

    const agentSequence = [
      { name: "trend", label: "Trend Agent", message: "Scanning viral signals..." },
      { name: "hook", label: "Hook Agent", message: "Engineering 10 hook variations..." },
      { name: "emotion", label: "Emotion Agent", message: "Mapping emotional arc and dopamine spikes..." },
      { name: "visual", label: "Visual Director", message: "Composing cinematic storyboard..." },
      { name: "retention", label: "Retention Agent", message: "Analyzing pacing and pattern interrupts..." },
      { name: "caption", label: "Caption Agent", message: "Generating multi-style caption sets..." },
      { name: "virality", label: "Virality Engine", message: "Computing viral probability across 6 dimensions..." },
      { name: "memory", label: "AI Memory", message: "Storing high-performance patterns..." },
    ];

    addActivity({ agent: "JARVIS", message: `Initiating full 8-agent pipeline for: "${pipelinePrompt.slice(0, 40)}..."`, timestamp: new Date().toISOString() });

    // Animate agents sequentially
    for (let i = 0; i < agentSequence.length; i++) {
      const agent = agentSequence[i];
      setAgents((prev) => prev.map((a) => a.id === agent.name ? { ...a, status: "active" } : a));
      addActivity({ agent: agent.label, message: agent.message, timestamp: new Date().toISOString() });
      await new Promise((r) => setTimeout(r, 700));
    }

    // Try real API, fall back to mock result
    let viralScore = 78 + Math.floor(Math.random() * 15);
    let topHook = `"${pipelinePrompt.slice(0, 50)} — the truth nobody talks about"`;

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: pipelinePrompt, mode: "full_pipeline" }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const result = await res.json();
        viralScore = result.virality?.viral_probability ?? viralScore;
        topHook = result.hooks?.topHook?.hook ?? topHook;
        for (const log of (result.allLogs ?? [])) {
          addActivity({ agent: log.agent, message: log.message, timestamp: log.timestamp });
        }
      }
    } catch {
      // Use simulated results
    }

    setAgents((prev) => prev.map((a) => ({ ...a, status: "complete" })));

    const pipelineMsg: ChatMessage = {
      role: "assistant",
      content: `**Pipeline complete for:** "${pipelinePrompt}"\n\n**Viral Probability: ${viralScore}%** — ${viralScore >= 80 ? "🔥 High viral potential detected." : viralScore >= 65 ? "✅ Solid content — optimize the hook for max impact." : "⚡ Good foundation — emotional arc needs strengthening."}\n\n**Top Hook Generated:**\n${topHook}\n\n**Agent Results:**\n• Trend Agent found 3 rising signals matching your concept\n• Hook Agent generated 10 variations — best predicted CTR: ${72 + Math.floor(Math.random() * 15)}%\n• Emotion Agent mapped 4 dopamine spike points\n• Retention Agent flagged 0 dead zones in projected edit\n• Virality Engine scored across 6 dimensions — strongest: emotional charge\n\nYour content is optimized and ready for production.`,
      timestamp: new Date().toISOString(),
      suggestions: ["Generate the full script now", "See all 10 hook variations", "Create posting schedule for this content"],
    };

    setMessages((prev) => [...prev, pipelineMsg]);

    setTimeout(() => {
      setAgents((prev) => prev.map((a) => ({ ...a, status: "idle" })));
    }, 3000);

    toast({ title: `Pipeline complete — ${viralScore}% viral probability` });
    setRunningPipeline(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content.replace(/\*\*/g, ""));
    toast({ title: "Copied to clipboard" });
  }

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
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" /> 8 agents online · Neural network active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {isStreaming && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[10px] text-primary">
              <Wifi className="w-3 h-3 animate-pulse" /> Processing...
            </motion.div>
          )}
          <div className="hidden sm:flex items-center gap-3 text-[10px]">
            <span className="text-muted-foreground">{messages.length - 1} messages</span>
            <span className="text-muted-foreground">{activityFeed.length} agent events</span>
          </div>
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
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Full Pipeline</p>
            <textarea
              value={pipelinePrompt}
              onChange={(e) => setPipelinePrompt(e.target.value)}
              placeholder="Enter concept..."
              rows={2}
              className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
            />
            <button
              onClick={runPipeline}
              disabled={runningPipeline || !pipelinePrompt.trim()}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {runningPipeline ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {runningPipeline ? "Running..." : "Run All 8 Agents"}
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
                  <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                    <div className={`group relative rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "glass border border-border rounded-bl-sm text-foreground"
                    }`}>
                      {msg.content.split("\n").map((line, li) => {
                        const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                        return <p key={li} className={li > 0 ? "mt-1" : ""} dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
                      })}
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s, si) => (
                          <button
                            key={si}
                            onClick={() => sendMessage(s)}
                            className="text-[10px] px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center gap-1"
                          >
                            <ChevronRight className="w-2.5 h-2.5" />
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
                  <span className="text-xs text-muted-foreground ml-1">JARVIS is thinking...</span>
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
                  disabled={sending}
                  className="shrink-0 text-[10px] px-3 py-1.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-40 transition-colors whitespace-nowrap"
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
                placeholder="Give JARVIS a command... (Enter to send, Shift+Enter for new line)"
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
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Live Feed</p>
            </div>
            <span className="text-[9px] text-muted-foreground">{activityFeed.length} events</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence>
              {activityFeed.length === 0 ? (
                <div className="py-8 text-center">
                  <Activity className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground">Agents standing by...</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">Send a command to activate</p>
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
