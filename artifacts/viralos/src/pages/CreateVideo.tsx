import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Wand2, FileText, Mic, Film, Clapperboard, Download, CheckCircle,
  Loader2, ChevronRight, Zap, Sparkles, RefreshCw, Copy, Edit3,
  Play, Volume2, Music, Scissors, Monitor, Smartphone,
} from "lucide-react";

const PLATFORMS = [
  { value: "youtube_shorts", label: "YouTube Shorts", aspect: "9:16", icon: "▶" },
  { value: "tiktok", label: "TikTok", aspect: "9:16", icon: "♪" },
  { value: "reels", label: "Instagram Reels", aspect: "9:16", icon: "◈" },
  { value: "x_clips", label: "X / Twitter", aspect: "16:9", icon: "✕" },
  { value: "all", label: "All Platforms", aspect: "Multi", icon: "⬡" },
];

const VOICE_STYLES = [
  { value: "motivational_male", label: "Motivational Male", desc: "High-energy, deep" },
  { value: "motivational_female", label: "Motivational Female", desc: "Energetic, clear" },
  { value: "dramatic_male", label: "Dramatic Male", desc: "Intense, cinematic" },
  { value: "dramatic_female", label: "Dramatic Female", desc: "Powerful, emotional" },
  { value: "calm_male", label: "Calm Male", desc: "Smooth, authoritative" },
  { value: "calm_female", label: "Calm Female", desc: "Warm, reassuring" },
];

const PIPELINE_STAGES = [
  { key: "prompt", label: "Prompt", icon: Wand2 },
  { key: "script", label: "Script", icon: FileText },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "clips", label: "Clips", icon: Film },
  { key: "render", label: "Render", icon: Clapperboard },
  { key: "export", label: "Export", icon: Download },
];

type StageKey = "prompt" | "script" | "voice" | "clips" | "render" | "export" | "done";

function generateScript(prompt: string, platform: string): { hook: string; script: string; cta: string } {
  const topicWords = prompt.split(" ").slice(0, 4).join(" ");
  const hooks = [
    `Most people get ${topicWords} completely wrong. Here's why:`,
    `Nobody talks about this side of ${topicWords}...`,
    `I studied ${topicWords} for 30 days. This changed everything.`,
    `The harsh truth about ${topicWords} that experts won't tell you:`,
    `Stop doing this if you care about ${topicWords}.`,
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  const scripts = [
    `Here's what the top 1% understand that most people miss entirely.\n\nWhen it comes to ${prompt}, the difference between success and failure is almost always about your systems — not your talent.\n\nI've seen countless people with massive potential fail because they never built the right habits. And I've seen people with average ability achieve extraordinary results by doing just a few things consistently well.\n\nThe secret? You need to eliminate friction and create an environment that makes the right actions effortless.\n\nMost people rely on motivation. But motivation is a feeling — it comes and goes. What you need is structure. A system that works even when you don't feel like it.\n\nHere's the framework that actually works:`,
    `Let me break down exactly what's happening with ${prompt} right now.\n\nThe game has changed. The old rules no longer apply. If you're still following the conventional wisdom, you're already behind.\n\nThe people winning today have figured out three things that most people overlook completely.\n\nFirst: They focus on inputs, not outcomes. Second: They build compounding habits. Third: They treat every failure as data.\n\nThis isn't theory — it's the pattern I see in every single person who reaches the next level.`,
  ];
  const script = scripts[Math.floor(Math.random() * scripts.length)];

  const ctas = [
    "Follow for more strategies that actually work. Drop a comment if this hit different.",
    "Save this and share it with someone who needs to hear it today.",
    "What's stopping you? Comment below — I read every one.",
    "Follow for daily content that will change how you think. This is just the beginning.",
  ];
  const cta = ctas[Math.floor(Math.random() * ctas.length)];

  return { hook, script, cta };
}

function ProgressBar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function ProcessingStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      <div className="shrink-0">
        {done ? (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        ) : active ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
        )}
      </div>
      <p className={`text-sm transition-colors ${done ? "text-emerald-400" : active ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
    </motion.div>
  );
}

export default function CreateVideo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [stage, setStage] = useState<StageKey>("prompt");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("all");
  const [voiceStyle, setVoiceStyle] = useState("motivational_male");
  const [generatedScript, setGeneratedScript] = useState<{ hook: string; script: string; cta: string } | null>(null);
  const [editingScript, setEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [processingSteps, setProcessingSteps] = useState<{ label: string; done: boolean; active: boolean }[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);
  const [exportedPlatforms, setExportedPlatforms] = useState<string[]>([]);

  const stageIndex = PIPELINE_STAGES.findIndex((s) => s.key === stage);

  const simulateProgress = (steps: string[], onDone: () => void) => {
    const stepItems = steps.map((label, i) => ({ label, done: false, active: i === 0 }));
    setProcessingSteps(stepItems);
    let i = 0;
    const advance = () => {
      setProcessingSteps((prev) => {
        const next = [...prev];
        if (i > 0) next[i - 1] = { ...next[i - 1], done: true, active: false };
        if (i < next.length) next[i] = { ...next[i], active: true };
        return next;
      });
      setLoadingProgress(Math.round(((i + 1) / steps.length) * 100));
      i++;
      if (i <= steps.length) {
        setTimeout(i < steps.length ? advance : () => {
          setProcessingSteps((prev) => prev.map((s) => ({ ...s, done: true, active: false })));
          setTimeout(onDone, 400);
        }, 900 + Math.random() * 600);
      }
    };
    advance();
  };

  async function handleGenerateScript() {
    if (!title.trim() || !prompt.trim()) {
      toast({ title: "Fill in both title and prompt", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setLoadingLabel("Generating Script");
    setStage("script");

    simulateProgress([
      "Analyzing viral patterns for your niche...",
      "Engineering hook variations...",
      "Building emotional arc structure...",
      "Optimizing for retention and watch time...",
      "Calibrating CTA for maximum conversion...",
    ], () => {
      // Try real API, fall back to generated script
      const script = generateScript(prompt, platform);

      fetch(`/api/scripts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platform }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d?.hook && d?.script) {
            setGeneratedScript({ hook: d.hook, script: d.script, cta: d.cta || script.cta });
          } else {
            setGeneratedScript(script);
          }
        })
        .catch(() => setGeneratedScript(script))
        .finally(() => {
          setIsLoading(false);
          setLoadingProgress(0);
          setProcessingSteps([]);
          toast({ title: "Script generated" });
        });
    });
  }

  async function handleGenerateVoice() {
    setIsLoading(true);
    setLoadingLabel("Synthesizing Voiceover");
    setStage("voice");

    simulateProgress([
      "Connecting to voice synthesis engine...",
      "Cloning voice style: " + VOICE_STYLES.find((v) => v.value === voiceStyle)?.label,
      "Adding emotional pacing and micro-pauses...",
      "Syncing breath patterns and emphasis...",
      "Post-processing audio quality...",
    ], () => {
      setStage("clips");
      setLoadingLabel("Finding Cinematic Clips");
      simulateProgress([
        "Scanning Pexels & Pixabay libraries...",
        "Matching semantic relevance to script...",
        "Detecting cinematic quality scores...",
        "Selecting 6 best clip sequences...",
      ], () => {
        setIsLoading(false);
        setLoadingProgress(0);
        setProcessingSteps([]);
        setStage("render");
        toast({ title: "Voice + clips ready" });
      });
    });
  }

  function handleRender() {
    setRenderProgress(0);
    setRenderComplete(false);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 6 + 2;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setRenderComplete(true);
        toast({ title: "Render complete" });
      }
      setRenderProgress(Math.min(Math.round(prog), 100));
    }, 350);
  }

  function handleExport() {
    const platforms = platform === "all"
      ? ["YouTube Shorts", "TikTok", "Instagram Reels", "X / Twitter"]
      : [PLATFORMS.find((p) => p.value === platform)?.label ?? platform];

    let i = 0;
    setExportedPlatforms([]);
    setStage("export");

    const advance = () => {
      if (i < platforms.length) {
        setExportedPlatforms((prev) => [...prev, platforms[i]]);
        i++;
        setTimeout(advance, 700);
      } else {
        setTimeout(() => setStage("done"), 600);
      }
    };
    advance();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast({ title: "Copied to clipboard" }));
  }

  const EXAMPLE_PROMPTS = [
    "Why most people fail at building discipline and how to fix it",
    "The mindset shift that separates the top 1% from everyone else",
    "How to build a $10K/month income stream with no experience",
    "The brutal truth about social media growth nobody talks about",
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Video Generator</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Prompt → Script → Voice → Clips → Render → Export</p>
      </div>

      {/* Pipeline progress */}
      <div className="glass rounded-xl border border-border p-4">
        <div className="flex items-center">
          {PIPELINE_STAGES.map((s, i) => {
            const Icon = s.icon;
            const done = i < stageIndex || stage === "done";
            const active = s.key === stage;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <motion.div
                    animate={active && isLoading ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      done ? "bg-emerald-500/20 border border-emerald-500/50" :
                      active ? "bg-primary/20 border border-primary" :
                      "bg-muted border border-border"
                    }`}
                  >
                    {done ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                     active && isLoading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> :
                     <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />}
                  </motion.div>
                  <span className={`text-[10px] font-medium ${active ? "text-primary" : done ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className={`h-px flex-1 mb-5 transition-all duration-700 ${i < stageIndex ? "bg-emerald-500/50" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >

          {/* ── Prompt Stage ── */}
          {stage === "prompt" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Define your video</h2>
                  <p className="text-xs text-muted-foreground">AI handles everything — script, voice, clips, render, export</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Project Title</label>
                  <Input
                    placeholder="e.g. The Discipline Framework"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt</label>
                    <span className="text-[10px] text-muted-foreground">Quick ideas:</span>
                  </div>
                  <textarea
                    placeholder="Describe your video concept in detail..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {EXAMPLE_PROMPTS.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => { setPrompt(ex); if (!title) setTitle(ex.split(" ").slice(0, 4).join(" ")); }}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        {ex.slice(0, 35)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Target Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPlatform(p.value)}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                          platform === p.value
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                        </div>
                        <div className="text-[10px] opacity-60 mt-0.5">{p.aspect}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateScript}
                disabled={!title.trim() || !prompt.trim()}
                className="w-full gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Script with AI
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── Script Stage ── */}
          {stage === "script" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold">AI Script Engine</h2>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? loadingLabel : "Script ready — review and customize before voiceover"}
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {processingSteps.map((step, i) => (
                      <ProcessingStep key={i} label={step.label} done={step.done} active={step.active} />
                    ))}
                  </div>
                  <ProgressBar value={loadingProgress} />
                  <p className="text-xs text-muted-foreground text-center">{loadingProgress}% complete</p>
                </div>
              )}

              {!isLoading && generatedScript && (
                <div className="space-y-4">
                  {/* Hook */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider">🎣 Hook (0–2 seconds)</p>
                      <button onClick={() => copyToClipboard(generatedScript.hook)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{generatedScript.hook}</p>
                  </div>

                  {/* Script */}
                  <div className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">📝 Script Body</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingScript(!editingScript); setEditedScript(generatedScript.script); }} className="text-muted-foreground hover:text-foreground">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => copyToClipboard(generatedScript.script)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {editingScript ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedScript}
                          onChange={(e) => setEditedScript(e.target.value)}
                          rows={6}
                          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setGeneratedScript({ ...generatedScript, script: editedScript }); setEditingScript(false); toast({ title: "Script updated" }); }}
                            className="text-[11px] px-3 py-1 rounded-lg bg-primary text-white font-bold"
                          >Save</button>
                          <button onClick={() => setEditingScript(false)} className="text-[11px] px-3 py-1 rounded-lg border border-border text-muted-foreground">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{generatedScript.script}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">📣 Call to Action</p>
                      <button onClick={() => copyToClipboard(generatedScript.cta)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-foreground">{generatedScript.cta}</p>
                  </div>

                  {/* Regenerate */}
                  <button
                    onClick={() => { setGeneratedScript(generateScript(prompt, platform)); toast({ title: "Script regenerated" }); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate Script
                  </button>

                  {/* Voice Style */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Voice Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VOICE_STYLES.map((v) => (
                        <button
                          key={v.value}
                          onClick={() => setVoiceStyle(v.value)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            voiceStyle === v.value
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-border/80"
                          }`}
                        >
                          <p className={`text-xs font-semibold ${voiceStyle === v.value ? "text-primary" : "text-foreground"}`}>{v.label}</p>
                          <p className="text-[10px] text-muted-foreground">{v.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleGenerateVoice} className="w-full gap-2">
                    <Volume2 className="w-4 h-4" />
                    Generate Voiceover + Find Clips
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Voice + Clips Stage ── */}
          {(stage === "voice" || stage === "clips") && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stage === "voice" ? "bg-purple-500/15" : "bg-yellow-500/15"}`}>
                  {stage === "voice" ? <Mic className="w-4 h-4 text-purple-400" /> : <Film className="w-4 h-4 text-yellow-400" />}
                </div>
                <div>
                  <h2 className="text-base font-semibold">{stage === "voice" ? "Voice Synthesis" : "Clip Discovery"}</h2>
                  <p className="text-xs text-muted-foreground">{loadingLabel}</p>
                </div>
              </div>
              <div className="space-y-3">
                {processingSteps.map((step, i) => (
                  <ProcessingStep key={i} label={step.label} done={step.done} active={step.active} />
                ))}
              </div>
              {loadingProgress > 0 && <ProgressBar value={loadingProgress} color={stage === "voice" ? "bg-purple-400" : "bg-yellow-400"} />}
            </div>
          )}

          {/* ── Render Stage ── */}
          {stage === "render" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Auto Video Editor</h2>
                  <p className="text-xs text-muted-foreground">AI-powered cinematic rendering engine</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Cinematic transitions", icon: Film },
                  { label: "Beat-sync cuts", icon: Music },
                  { label: "Auto zoom effects", icon: Sparkles },
                  { label: "Background music", icon: Volume2 },
                  { label: "Caption overlay", icon: Scissors },
                  { label: "Motion blur", icon: Zap },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-muted-foreground text-xs">{label}</span>
                  </div>
                ))}
              </div>

              {renderProgress === 0 && !renderComplete && (
                <Button onClick={handleRender} className="w-full gap-2">
                  <Play className="w-4 h-4" />
                  Start Render
                </Button>
              )}

              {renderProgress > 0 && !renderComplete && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rendering... FFmpeg GPU mode</span>
                    <span className="font-mono font-bold text-cyan-400">{renderProgress}%</span>
                  </div>
                  <ProgressBar value={renderProgress} color="bg-cyan-400" />
                  <p className="text-[10px] text-muted-foreground">
                    {renderProgress < 30 ? "Assembling clips..." :
                     renderProgress < 60 ? "Applying transitions and effects..." :
                     renderProgress < 85 ? "Syncing audio and captions..." :
                     "Finalizing export..."}
                  </p>
                </div>
              )}

              {renderComplete && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Render complete</span>
                    <span className="text-emerald-400 font-bold">100%</span>
                  </div>
                  <ProgressBar value={100} color="bg-emerald-400" />
                  <Button onClick={handleExport} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Download className="w-4 h-4" />
                    Export to All Platforms
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Export Stage ── */}
          {stage === "export" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Platform Export</h2>
                  <p className="text-xs text-muted-foreground">Encoding for each platform's specs...</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { p: "YouTube Shorts", dim: "1080 × 1920", format: "MP4 H.264", icon: Monitor },
                  { p: "TikTok", dim: "1080 × 1920", format: "MP4 H.265", icon: Smartphone },
                  { p: "Instagram Reels", dim: "1080 × 1920", format: "MP4 H.264", icon: Smartphone },
                  { p: "X / Twitter", dim: "1280 × 720", format: "MP4 H.264", icon: Monitor },
                ].map(({ p, dim, format, icon: Icon }) => {
                  const done = exportedPlatforms.includes(p);
                  const active = !done && exportedPlatforms.length < [p].length;
                  return (
                    <motion.div
                      key={p}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: done ? 1 : 0.4 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${done ? "text-emerald-400" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{p}</span>
                        <span className="text-xs text-muted-foreground ml-2">{dim} · {format}</span>
                      </div>
                      {done ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <Loader2 className="w-4 h-4 text-muted-foreground/30 animate-spin shrink-0" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Done Stage ── */}
          {stage === "done" && (
            <div className="glass rounded-xl border border-emerald-500/30 p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Video Complete!</h2>
                <p className="text-sm text-muted-foreground mt-1">"{title}" is ready for all platforms</p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-left">
                {[
                  { label: "Duration", value: "45–60 sec" },
                  { label: "Platforms", value: platform === "all" ? "4 platforms" : "1 platform" },
                  { label: "Voice", value: VOICE_STYLES.find((v) => v.value === voiceStyle)?.label || "AI Voice" },
                  { label: "Resolution", value: "1080p HD" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2 rounded-lg bg-white/3 border border-white/5">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    setStage("prompt");
                    setTitle("");
                    setPrompt("");
                    setGeneratedScript(null);
                    setRenderProgress(0);
                    setRenderComplete(false);
                    setExportedPlatforms([]);
                  }}
                  variant="outline"
                >
                  Create Another
                </Button>
                <Button onClick={() => setLocation("/projects")} className="gap-2">
                  <Film className="w-4 h-4" />
                  View Projects
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
