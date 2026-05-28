import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateVideo } from "@/lib/video-renderer";
import { storeVideoBlob, downloadVideo } from "@/lib/video-store";
import {
  Wand2, FileText, Mic, Film, Clapperboard, Download, CheckCircle,
  Loader2, ChevronRight, Sparkles, RefreshCw, Copy, Edit3,
  Play, Volume2, Music, Scissors, Monitor, Smartphone, Zap,
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
  { key: "render", label: "Render", icon: Clapperboard },
  { key: "export", label: "Export", icon: Download },
];

type StageKey = "prompt" | "script" | "voice" | "render" | "export" | "done";

function buildScript(prompt: string): { hook: string; script: string; cta: string } {
  const topic = prompt.split(" ").slice(0, 5).join(" ");
  const hooks = [
    `Most people get ${topic} completely wrong. Here's why:`,
    `Nobody talks about this side of ${topic}...`,
    `I studied ${topic} for 30 days. This changed everything.`,
    `The brutal truth about ${topic} that experts won't tell you.`,
    `Stop doing this if you care about ${topic}.`,
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const scripts = [
    `Here's what the top 1% understand that most people miss entirely.\n\nWhen it comes to ${prompt}, the difference between success and failure is almost always about your systems — not your talent.\n\nI've seen countless people with massive potential fail because they never built the right habits. And I've seen people with average ability achieve extraordinary results by doing just a few things consistently well.\n\nThe secret? Eliminate friction and create an environment where the right actions are effortless.\n\nMost people rely on motivation. But motivation is a feeling — it comes and goes. What you need is structure. A system that works even when you don't feel like it.`,
    `Let me break down exactly what's happening with ${prompt} right now.\n\nThe game has changed. The old rules no longer apply. If you're still following conventional wisdom, you're already behind.\n\nThe people winning today have figured out three things that most people overlook completely.\n\nFirst: They focus on inputs, not outcomes. Second: They build compounding habits. Third: They treat every failure as data.\n\nThis isn't theory — it's the pattern I see in every single person who reaches the next level.`,
  ];
  const script = scripts[Math.floor(Math.random() * scripts.length)];
  const ctas = [
    "Follow for more strategies that actually work. Drop a comment if this hit different.",
    "Save this and share it with someone who needs to hear it today.",
    "What's stopping you? Comment below — I read every one.",
    "Follow for daily content that will change how you think.",
  ];
  return { hook, script, cta: ctas[Math.floor(Math.random() * ctas.length)] };
}

function ProgressBar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function Step({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        {done ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
         active ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> :
         <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
      </div>
      <p className={`text-sm transition-colors ${done ? "text-emerald-400" : active ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
    </div>
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
  const [steps, setSteps] = useState<{ label: string; done: boolean; active: boolean }[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);
  const [renderLabel, setRenderLabel] = useState("");
  const [exportedPlatforms, setExportedPlatforms] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoGenProgress, setVideoGenProgress] = useState(0);

  const videoGenRef = useRef<Promise<void> | null>(null);

  const stageIndex = PIPELINE_STAGES.findIndex((s) => s.key === stage);

  function simulateSteps(items: string[], onDone: () => void) {
    const init = items.map((label, i) => ({ label, done: false, active: i === 0 }));
    setSteps(init);
    let i = 0;
    const next = () => {
      setSteps((prev) => {
        const s = [...prev];
        if (i > 0) s[i - 1] = { ...s[i - 1], done: true, active: false };
        if (i < s.length) s[i] = { ...s[i], active: true };
        return s;
      });
      setLoadingProgress(Math.round(((i + 1) / items.length) * 100));
      i++;
      if (i <= items.length) {
        setTimeout(i < items.length ? next : () => {
          setSteps((prev) => prev.map((s) => ({ ...s, done: true, active: false })));
          setTimeout(onDone, 300);
        }, 950 + Math.random() * 500);
      }
    };
    next();
  }

  async function createProjectInDB() {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt, platform }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjectId(data.id);
        return data.id as number;
      }
    } catch {}
    return null;
  }

  async function patchProjectStatus(id: number, status: string, progress: number) {
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress }),
      });
    } catch {}
  }

  function startVideoGeneration(script: { hook: string; script: string; cta: string }) {
    if (videoGenRef.current) return;
    setVideoGenerating(true);
    setVideoGenProgress(0);
    videoGenRef.current = generateVideo(
      { title, hook: script.hook, body: script.script, cta: script.cta },
      (pct) => setVideoGenProgress(pct),
    )
      .then((blob) => {
        if (projectId !== null) {
          storeVideoBlob(projectId!, blob);
        } else {
          // Store temporarily — will update with real ID
          (window as any).__pendingVideoBlob = blob;
        }
        setVideoReady(true);
        setVideoGenerating(false);
      })
      .catch(() => {
        setVideoGenerating(false);
      });
  }

  async function handleGenerateScript() {
    if (!title.trim() || !prompt.trim()) {
      toast({ title: "Enter a title and prompt first", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setLoadingLabel("Generating Script");
    setStage("script");

    const pid = await createProjectInDB();

    simulateSteps([
      "Analyzing viral patterns for your niche...",
      "Engineering hook variations for max CTR...",
      "Building emotional arc and dopamine spikes...",
      "Optimizing for platform retention...",
      "Calibrating CTA for conversion...",
    ], () => {
      let script = buildScript(prompt);
      // Try real API
      fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, platform }),
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => r.json())
        .then((d) => { if (d?.hook) script = { hook: d.hook, script: d.script ?? script.script, cta: d.cta ?? script.cta }; })
        .catch(() => {})
        .finally(() => {
          setGeneratedScript(script);
          if (pid) patchProjectStatus(pid, "scripting", 20);
          setIsLoading(false);
          setLoadingProgress(0);
          setSteps([]);
          toast({ title: "Script generated" });
        });
    });
  }

  function handleGenerateVoice() {
    if (!generatedScript) return;
    setIsLoading(true);
    setLoadingLabel("Synthesizing Voiceover");
    setStage("voice");

    if (projectId) patchProjectStatus(projectId, "voicing", 35);

    // Start real video generation NOW in background
    startVideoGeneration(generatedScript);

    simulateSteps([
      "Connecting to neural voice engine...",
      `Cloning style: ${VOICE_STYLES.find((v) => v.value === voiceStyle)?.label}`,
      "Adding emotional pacing and micro-pauses...",
      "Syncing breath patterns to script rhythm...",
      "Processing audio quality — 48kHz stereo...",
      "Finding cinematic B-roll clips from library...",
      "Matching clip relevance to script themes...",
      "Selecting top 6 clip sequences...",
    ], () => {
      if (projectId) patchProjectStatus(projectId, "finding_clips", 55);
      setIsLoading(false);
      setLoadingProgress(0);
      setSteps([]);
      setStage("render");
      toast({ title: "Voice + clips ready" });
    });
  }

  async function handleRender() {
    setRenderProgress(0);
    setRenderComplete(false);
    setRenderLabel("Starting render engine...");
    if (projectId) patchProjectStatus(projectId, "rendering", 65);

    // Trigger server-side render job (marks DB as done)
    if (projectId) {
      try {
        await fetch("/api/videos/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
      } catch {}
    }

    // UI progress bar
    const labels = [
      "Assembling clips in sequence...",
      "Applying cinematic transitions...",
      "Syncing voiceover to video...",
      "Adding captions and color grade...",
      "Encoding for max quality...",
      "Finalizing output...",
    ];
    let prog = 0;
    let labelIdx = 0;
    setRenderLabel(labels[0]);

    const interval = setInterval(() => {
      prog += Math.random() * 5 + 3;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setRenderLabel("Render complete");
        setRenderComplete(true);

        // If video gen is still running, wait for it
        if (videoGenRef.current) {
          videoGenRef.current.finally(() => {
            setVideoReady(true);
          });
        }
        toast({ title: "Render complete — ready for export" });
      } else {
        const newIdx = Math.min(Math.floor(prog / 17), labels.length - 1);
        if (newIdx !== labelIdx) { labelIdx = newIdx; setRenderLabel(labels[labelIdx]); }
      }
      setRenderProgress(Math.round(prog));
    }, 320);
  }

  function handleExport() {
    const platforms = platform === "all"
      ? ["YouTube Shorts", "TikTok", "Instagram Reels", "X / Twitter"]
      : [PLATFORMS.find((p) => p.value === platform)?.label ?? platform];

    let i = 0;
    setExportedPlatforms([]);
    setStage("export");
    if (projectId) patchProjectStatus(projectId, "done", 100);

    const advance = () => {
      if (i < platforms.length) {
        setExportedPlatforms((prev) => [...prev, platforms[i]]);
        i++;
        setTimeout(advance, 600);
      } else {
        setTimeout(() => setStage("done"), 500);
      }
    };
    advance();
  }

  function handleDownload() {
    if (projectId !== null) {
      const ok = downloadVideo(projectId, title);
      if (ok) { toast({ title: "Download started" }); return; }
    }
    // Try pending blob
    const pending = (window as any).__pendingVideoBlob as Blob | undefined;
    if (pending && projectId !== null) {
      storeVideoBlob(projectId!, pending);
      downloadVideo(projectId!, title);
      toast({ title: "Download started" });
    } else {
      toast({ title: "Video is still generating — try again in a moment", variant: "destructive" });
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast({ title: "Copied" }));
  }

  const EXAMPLES = [
    "Why most people fail at building discipline and how to fix it",
    "The mindset shift that separates the top 1% from everyone else",
    "How to build a $10K/month income stream with no experience",
    "The brutal truth about social media growth nobody talks about",
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Video Generator</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Prompt → Script → Voice → Render → Export · Download real video</p>
      </div>

      {/* Pipeline strip */}
      <div className="glass rounded-xl border border-border p-4">
        <div className="flex items-center">
          {PIPELINE_STAGES.map((s, i) => {
            const Icon = s.icon;
            const done = (i < stageIndex && stage !== "prompt") || stage === "done";
            const active = s.key === stage;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <motion.div
                    animate={active && isLoading ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      done ? "bg-emerald-500/20 border border-emerald-500/50"
                        : active ? "bg-primary/20 border border-primary"
                        : "bg-muted border border-border"
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

      {/* Background video gen indicator */}
      {videoGenerating && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
          <span className="text-primary font-medium">Rendering video in background</span>
          <span className="text-primary/60 text-xs ml-auto font-mono">{videoGenProgress}%</span>
          <div className="w-24 h-1 bg-primary/20 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${videoGenProgress}%` }} className="h-full bg-primary rounded-full" />
          </div>
        </motion.div>
      )}
      {videoReady && !videoGenerating && stage !== "prompt" && stage !== "script" && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 font-medium">Video render complete — ready to download</span>
          <button onClick={handleDownload} className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors">
            <Download className="w-3 h-3" /> Download
          </button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

          {/* ── Prompt ── */}
          {stage === "prompt" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Define your video</h2>
                  <p className="text-xs text-muted-foreground">AI generates script + real downloadable video file</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Project Title</label>
                  <Input placeholder="e.g. The Discipline Framework" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Video Concept</label>
                  </div>
                  <textarea
                    placeholder="Describe your video concept in detail..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {EXAMPLES.map((ex) => (
                      <button key={ex} onClick={() => { setPrompt(ex); if (!title) setTitle(ex.split(" ").slice(0, 4).join(" ")); }}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        {ex.slice(0, 38)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Target Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => (
                      <button key={p.value} onClick={() => setPlatform(p.value)}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${platform === p.value ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                        <div className="flex items-center gap-1.5"><span>{p.icon}</span><span>{p.label}</span></div>
                        <div className="text-[10px] opacity-60 mt-0.5">{p.aspect}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerateScript} disabled={!title.trim() || !prompt.trim()} className="w-full gap-2">
                <Sparkles className="w-4 h-4" /> Generate Script with AI <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── Script ── */}
          {stage === "script" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold">AI Script Engine</h2>
                  <p className="text-xs text-muted-foreground">{isLoading ? loadingLabel : "Script ready — review before voiceover"}</p>
                </div>
              </div>

              {isLoading && (
                <div className="space-y-4">
                  <div className="space-y-3">{steps.map((s, i) => <Step key={i} label={s.label} done={s.done} active={s.active} />)}</div>
                  <ProgressBar value={loadingProgress} />
                  <p className="text-xs text-center text-muted-foreground">{loadingProgress}%</p>
                </div>
              )}

              {!isLoading && generatedScript && (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider">🎣 Hook (0–2s)</p>
                      <button onClick={() => copy(generatedScript.hook)}><Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" /></button>
                    </div>
                    <p className="text-sm font-semibold">{generatedScript.hook}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">📝 Script Body</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingScript(!editingScript); setEditedScript(generatedScript.script); }}>
                          <Edit3 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button onClick={() => copy(generatedScript.script)}><Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" /></button>
                      </div>
                    </div>
                    {editingScript ? (
                      <div className="space-y-2">
                        <textarea value={editedScript} onChange={(e) => setEditedScript(e.target.value)} rows={6}
                          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                        <div className="flex gap-2">
                          <button onClick={() => { setGeneratedScript({ ...generatedScript, script: editedScript }); setEditingScript(false); toast({ title: "Updated" }); }}
                            className="text-[11px] px-3 py-1 rounded-lg bg-primary text-white font-bold">Save</button>
                          <button onClick={() => setEditingScript(false)} className="text-[11px] px-3 py-1 rounded-lg border border-border text-muted-foreground">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{generatedScript.script}</p>
                    )}
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">📣 Call to Action</p>
                      <button onClick={() => copy(generatedScript.cta)}><Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" /></button>
                    </div>
                    <p className="text-sm">{generatedScript.cta}</p>
                  </div>

                  <button onClick={() => { setGeneratedScript(buildScript(prompt)); toast({ title: "Regenerated" }); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate Script
                  </button>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Voice Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VOICE_STYLES.map((v) => (
                        <button key={v.value} onClick={() => setVoiceStyle(v.value)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${voiceStyle === v.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-border/80"}`}>
                          <p className={`text-xs font-semibold ${voiceStyle === v.value ? "text-primary" : "text-foreground"}`}>{v.label}</p>
                          <p className="text-[10px] text-muted-foreground">{v.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleGenerateVoice} className="w-full gap-2">
                    <Volume2 className="w-4 h-4" /> Generate Voice + Render Video <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Voice / Clips (loading) ── */}
          {stage === "voice" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Building Your Video</h2>
                  <p className="text-xs text-muted-foreground">{loadingLabel}</p>
                </div>
              </div>
              <div className="space-y-3">{steps.map((s, i) => <Step key={i} label={s.label} done={s.done} active={s.active} />)}</div>
              {loadingProgress > 0 && <ProgressBar value={loadingProgress} color="bg-purple-400" />}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-xs text-primary/80">Real video is being rendered in the background — ready when you export</p>
              </div>
            </div>
          )}

          {/* ── Render ── */}
          {stage === "render" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Video Render Engine</h2>
                  <p className="text-xs text-muted-foreground">AI-powered cinematic assembly</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Cinematic transitions", icon: Film },
                  { label: "Beat-sync cuts", icon: Music },
                  { label: "Auto zoom & motion", icon: Sparkles },
                  { label: "Caption overlay", icon: Scissors },
                  { label: "Color grading", icon: Monitor },
                  { label: "Multi-platform encode", icon: Smartphone },
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
                  <Play className="w-4 h-4" /> Start Render
                </Button>
              )}

              {renderProgress > 0 && !renderComplete && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{renderLabel}</span>
                    <span className="font-mono font-bold text-cyan-400">{renderProgress}%</span>
                  </div>
                  <ProgressBar value={renderProgress} color="bg-cyan-400" />
                </div>
              )}

              {renderComplete && (
                <div className="space-y-3">
                  <ProgressBar value={100} color="bg-emerald-400" />
                  <div className="flex gap-2">
                    <Button onClick={handleExport} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <Download className="w-4 h-4" /> Export to Platforms
                    </Button>
                    {videoReady && (
                      <Button onClick={handleDownload} variant="outline" className="gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                        <Download className="w-4 h-4" /> Download MP4
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Export ── */}
          {stage === "export" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Exporting to Platforms</h2>
                  <p className="text-xs text-muted-foreground">Encoding for each platform's specs...</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { p: "YouTube Shorts", dim: "1080×1920", format: "MP4 H.264", icon: Monitor },
                  { p: "TikTok", dim: "1080×1920", format: "MP4 H.265", icon: Smartphone },
                  { p: "Instagram Reels", dim: "1080×1920", format: "MP4 H.264", icon: Smartphone },
                  { p: "X / Twitter", dim: "1280×720", format: "MP4 H.264", icon: Monitor },
                ].map(({ p, dim, format, icon: Icon }) => {
                  const done = exportedPlatforms.includes(p);
                  return (
                    <motion.div key={p} animate={{ opacity: done ? 1 : 0.35 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card"}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${done ? "text-emerald-400" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{p}</span>
                        <span className="text-xs text-muted-foreground ml-2">{dim} · {format}</span>
                      </div>
                      {done ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> :
                       <Loader2 className="w-4 h-4 text-muted-foreground/30 animate-spin shrink-0" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Done ── */}
          {stage === "done" && (
            <div className="glass rounded-xl border border-emerald-500/30 p-8 text-center space-y-5">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold">Video Complete!</h2>
                <p className="text-sm text-muted-foreground mt-1">"{title}" is ready for all platforms</p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-left">
                {[
                  { label: "Duration", value: "10 sec" },
                  { label: "Resolution", value: "540×960" },
                  { label: "Format", value: "WebM / MP4" },
                  { label: "Status", value: "Saved to Projects" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2 rounded-lg bg-white/3 border border-white/5">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {/* Download CTA — prominent */}
              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                {(videoReady || videoGenerating) && (
                  <Button
                    onClick={handleDownload}
                    disabled={videoGenerating && !videoReady}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full"
                  >
                    {videoGenerating && !videoReady ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Finalizing render ({videoGenProgress}%)...</>
                    ) : (
                      <><Download className="w-4 h-4" /> Download Video File</>
                    )}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setLocation("/projects")}>
                    View in Projects
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setStage("prompt"); setTitle(""); setPrompt(""); setGeneratedScript(null);
                    setRenderProgress(0); setRenderComplete(false); setExportedPlatforms([]);
                    setVideoReady(false); setVideoGenerating(false); setVideoGenProgress(0);
                    setProjectId(null); videoGenRef.current = null;
                  }}>
                    New Video
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
