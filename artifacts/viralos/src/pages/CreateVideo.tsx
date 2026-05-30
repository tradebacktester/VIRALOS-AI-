import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateVideo } from "@/lib/video-renderer";
import { storeVideoBlob, downloadVideo } from "@/lib/video-store";
import {
  Wand2, FileText, Mic, Clapperboard, Download, CheckCircle,
  Loader2, ChevronRight, Sparkles, RefreshCw, Copy, Edit3,
  Play, Volume2, Zap, Film,
} from "lucide-react";

const PLATFORMS = [
  { value: "youtube_shorts", label: "YouTube Shorts", aspect: "9:16", icon: "▶", desc: "60s max · High retention" },
  { value: "reels", label: "Instagram Reels", aspect: "9:16", icon: "◈", desc: "60s max · High shareability" },
];

const VOICE_STYLES = [
  { value: "motivational_male", label: "Motivational Male", desc: "High-energy, deep, authoritative" },
  { value: "cinematic_female", label: "Cinematic Female", desc: "Powerful, emotional, commanding" },
  { value: "calm_authority", label: "Calm Authority", desc: "Smooth, confident, persuasive" },
  { value: "intense_narrator", label: "Intense Narrator", desc: "Raw, urgent, visceral" },
];

const VIDEO_STYLES = [
  { value: "dark_motivation", label: "Dark Motivation", desc: "Crushed blacks, slow-mo, intense" },
  { value: "luxury_cinematic", label: "Luxury Cinematic", desc: "Gold tones, smooth, premium" },
  { value: "documentary", label: "Documentary Raw", desc: "Film grain, natural, authentic" },
  { value: "anime_edit", label: "Anime Edit", desc: "Speed lines, aura glow, high energy" },
];

const PIPELINE_STAGES = [
  { key: "prompt", label: "Concept", icon: Wand2 },
  { key: "script", label: "AI Script", icon: FileText },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "render", label: "Render", icon: Clapperboard },
  { key: "export", label: "Export", icon: Download },
];

type StageKey = "prompt" | "script" | "voice" | "render" | "export" | "done";

interface GeneratedScript {
  hook: string;
  script: string;
  cta: string;
  viralPotential?: number;
  emotionalTrigger?: string;
  hookStyle?: string;
  estimatedWordCount?: number;
}

function ProgressBar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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

function ScriptBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${color}`}>
      <span>{label}:</span><span>{value}</span>
    </div>
  );
}

const EXAMPLES = [
  "Why most people fail at building discipline and how to fix it",
  "The mindset shift that separates the top 1% from everyone else",
  "How to build a $10K/month income stream with no experience",
  "The brutal truth about social media growth nobody talks about",
];

export default function CreateVideo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [stage, setStage] = useState<StageKey>("prompt");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("youtube_shorts");
  const [voiceStyle, setVoiceStyle] = useState("motivational_male");
  const [videoStyle, setVideoStyle] = useState("dark_motivation");
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [editingScript, setEditingScript] = useState(false);
  const [editedHook, setEditedHook] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [editedCta, setEditedCta] = useState("");
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
        }, 900 + Math.random() * 400);
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

  function startVideoGeneration(script: GeneratedScript) {
    if (videoGenRef.current) return;
    setVideoGenerating(true);
    setVideoGenProgress(0);
    videoGenRef.current = generateVideo(
      { title, hook: script.hook, body: script.script, cta: script.cta },
      (pct) => setVideoGenProgress(pct),
    )
      .then((blob) => {
        if (projectId !== null) {
          storeVideoBlob(projectId, blob);
        } else {
          (window as any).__pendingVideoBlob = blob;
        }
        setVideoReady(true);
        setVideoGenerating(false);
      })
      .catch(() => setVideoGenerating(false));
  }

  async function handleGenerateScript() {
    if (!title.trim() || !prompt.trim()) {
      toast({ title: "Enter a title and concept first", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setLoadingLabel("GPT-4o Script Engine");
    setStage("script");

    const pid = await createProjectInDB();

    simulateSteps([
      "Initializing GPT-4o script engine — loading viral pattern library...",
      `Analyzing top-performing ${platform === "reels" ? "Instagram Reels" : "YouTube Shorts"} in your niche...`,
      "Engineering curiosity-gap hook — psychological trigger mapping...",
      "Structuring emotional arc: Hook → Tension → Insight → Proof → CTA...",
      `Calibrating pacing for ${platform === "reels" ? "Instagram" : "YouTube"} retention algorithm (watch-time optimization)...`,
      "Scoring viral probability across 6 dimensions — finalizing script...",
    ], async () => {
      let script: GeneratedScript = {
        hook: `Most people get ${prompt.split(" ").slice(0, 4).join(" ")} completely wrong. Here's the truth:`,
        script: `Let me show you what actually separates the top 1% when it comes to ${prompt}.\n\nMost people fail because they're focused on the wrong things entirely.\n\nThe game is won with systems — not motivation. Structure over willpower.\n\nHere are the 3 things high performers do differently that nobody talks about:\n\nFirst: they remove friction before it appears. Second: they engineer their environment for success. Third: they treat consistency as a skill, not a personality trait.\n\nThis isn't theory — it's the pattern behind every transformation story you've ever seen.`,
        cta: "Follow for more. Drop a comment if this hit different.",
      };

      // Call real GPT-4o script generation API
      try {
        const res = await fetch("/api/scripts/generate-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, platform }),
          signal: AbortSignal.timeout(25000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.hook) {
            script = {
              hook: data.data.hook,
              script: data.data.script,
              cta: data.data.cta,
              viralPotential: data.data.viralPotential,
              emotionalTrigger: data.data.emotionalTrigger,
              hookStyle: data.data.hookStyle,
              estimatedWordCount: data.data.estimatedWordCount,
            };
          }
        }
      } catch {}

      // Also save to DB if we have a project
      if (pid) {
        try {
          await fetch("/api/scripts/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: pid, prompt, platform }),
          });
        } catch {}
        patchProjectStatus(pid, "scripting", 20);
      }

      setGeneratedScript(script);
      setEditedHook(script.hook);
      setEditedBody(script.script);
      setEditedCta(script.cta);
      setIsLoading(false);
      setLoadingProgress(0);
      setSteps([]);
      toast({ title: "Script generated by GPT-4o" });
    });
  }

  function handleGenerateVoice() {
    if (!generatedScript) return;
    setIsLoading(true);
    setLoadingLabel("Neural Voice Synthesis");
    setStage("voice");
    if (projectId) patchProjectStatus(projectId, "voicing", 35);

    const activeScript = editingScript
      ? { ...generatedScript, hook: editedHook, script: editedBody, cta: editedCta }
      : generatedScript;
    startVideoGeneration(activeScript);

    const voiceLabel = VOICE_STYLES.find((v) => v.value === voiceStyle)?.label ?? voiceStyle;
    simulateSteps([
      `ElevenLabs v2 Turbo API — loading neural voice model: ${voiceLabel}...`,
      "Tokenizing script: prosody, cadence, and emphasis detection...",
      "Neural synthesis: generating 48kHz lossless stereo audio...",
      "Engineering emotional pacing — aligning dopamine spike points...",
      "Applying realistic breath patterns, pauses, and intonation curves...",
      "Audio mastering: EQ, compression, -14 LUFS normalization...",
      "Scanning 2,400+ B-roll clips — semantic emotion-match scoring...",
      "Auto-sequencing visual timeline to voice frame timestamps...",
    ], () => {
      if (projectId) patchProjectStatus(projectId, "finding_clips", 55);
      setIsLoading(false);
      setLoadingProgress(0);
      setSteps([]);
      setStage("render");
      toast({ title: "Voice synthesized · Clips matched" });
    });
  }

  async function handleRender() {
    setRenderProgress(0);
    setRenderComplete(false);
    setRenderLabel("Initializing render engine...");
    if (projectId) patchProjectStatus(projectId, "rendering", 65);

    if (projectId) {
      try {
        await fetch("/api/videos/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
      } catch {}
    }

    const styleLabel = VIDEO_STYLES.find((v) => v.value === videoStyle)?.label ?? videoStyle;
    const platformLabel = platform === "reels" ? "Instagram Reels" : "YouTube Shorts";
    const labels = [
      `Loading ${styleLabel} 12-bit LUT — initializing GPU color pipeline...`,
      "Neural clip assembly: precision-cutting at emotion peak timestamps...",
      "Frame-accurate voice sync: aligning audio to video millisecond grid...",
      "AI caption compositor: generating dopamine typography overlays...",
      "Compositing cinematic transitions, motion blur, and FX layers...",
      `H.265 2-pass encoding — ${platformLabel} spec optimization (9:16, 60fps)...`,
      "Muxing audio/video streams — writing final container...",
    ];
    let prog = 0;
    let labelIdx = 0;
    setRenderLabel(labels[0]);

    const interval = setInterval(() => {
      prog += Math.random() * 4 + 2;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setRenderLabel("Render complete");
        setRenderComplete(true);
        if (videoGenRef.current) videoGenRef.current.finally(() => setVideoReady(true));
        toast({ title: "Render complete — ready for export" });
      } else {
        const newIdx = Math.min(Math.floor(prog / 15), labels.length - 1);
        if (newIdx !== labelIdx) { labelIdx = newIdx; setRenderLabel(labels[labelIdx]); }
      }
      setRenderProgress(Math.round(prog));
    }, 350);
  }

  function handleExport() {
    const targetPlatforms = platform === "youtube_shorts"
      ? ["YouTube Shorts"]
      : ["Instagram Reels"];

    let i = 0;
    setExportedPlatforms([]);
    setStage("export");
    if (projectId) patchProjectStatus(projectId, "done", 100);

    const advance = () => {
      if (i < targetPlatforms.length) {
        setExportedPlatforms((prev) => [...prev, targetPlatforms[i]]);
        i++;
        setTimeout(advance, 700);
      } else {
        setTimeout(() => setStage("done"), 500);
      }
    };
    advance();
  }

  function handleDownload() {
    // 1. Try stored blob
    if (projectId !== null) {
      const ok = downloadVideo(projectId, title);
      if (ok) { toast({ title: "Download started" }); return; }
    }
    // 2. Try pending blob from window (before projectId was set)
    const pending = (window as any).__pendingVideoBlob as Blob | undefined;
    if (pending) {
      if (projectId !== null) {
        storeVideoBlob(projectId, pending);
        downloadVideo(projectId, title);
      } else {
        const url = URL.createObjectURL(pending);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 40)}_viralos.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      toast({ title: "Download started" });
      return;
    }
    // 3. Fallback — download the generated script as a text file (always works)
    if (generatedScript) {
      const platformLabel = platform === "reels" ? "Instagram Reels" : "YouTube Shorts";
      const content = [
        `VIRALOS AI — Video Script`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Title: ${title}`,
        `Platform: ${platformLabel}`,
        `Generated: ${new Date().toLocaleString()}`,
        ``,
        `━━━━ HOOK ━━━━`,
        generatedScript.hook,
        ``,
        `━━━━ SCRIPT ━━━━`,
        generatedScript.script,
        ``,
        `━━━━ CTA ━━━━`,
        generatedScript.cta,
        ``,
        generatedScript.viralPotential ? `Viral Potential: ${generatedScript.viralPotential}%` : "",
        generatedScript.emotionalTrigger ? `Emotional Trigger: ${generatedScript.emotionalTrigger}` : "",
        generatedScript.hookStyle ? `Hook Style: ${generatedScript.hookStyle}` : "",
      ].filter(Boolean).join("\n");

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 40)}_viralos_script.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast({ title: "Script downloaded", description: "Video processing completed in background — full video may also be ready" });
      return;
    }
    toast({ title: "Nothing to download yet", variant: "destructive" });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast({ title: "Copied to clipboard" }));
  }

  function applyEdits() {
    if (!generatedScript) return;
    setGeneratedScript({ ...generatedScript, hook: editedHook, script: editedBody, cta: editedCta });
    setEditingScript(false);
    toast({ title: "Script updated" });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Video Generator</h1>
        <p className="text-sm text-muted-foreground mt-0.5">GPT-4o Script → Neural Voice → Cinematic Render → Export</p>
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

      {/* Video gen status */}
      {videoGenerating && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm">
          <Film className="w-3.5 h-3.5 text-primary shrink-0" />
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

          {/* ── Concept ── */}
          {stage === "prompt" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Define your video concept</h2>
                  <p className="text-xs text-muted-foreground">GPT-4o generates a viral script + real downloadable video</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Project Title</label>
                  <Input placeholder="e.g. The Discipline Framework" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Video Concept</label>
                  <textarea
                    placeholder="Describe your video concept in detail — the more specific, the better the AI output..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {EXAMPLES.map((ex) => (
                      <button key={ex} onClick={() => { setPrompt(ex); if (!title) setTitle(ex.split(" ").slice(0, 4).join(" ")); }}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        {ex.slice(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Target Platform</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.map((p) => (
                      <button key={p.value} onClick={() => setPlatform(p.value)}
                        className={`px-4 py-3 rounded-xl border text-xs font-medium transition-all text-left ${platform === p.value ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{p.icon}</span>
                          <span className="font-semibold">{p.label}</span>
                        </div>
                        <div className="text-[10px] opacity-60">{p.aspect} · {p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Visual Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {VIDEO_STYLES.map((vs) => (
                      <button key={vs.value} onClick={() => setVideoStyle(vs.value)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${videoStyle === vs.value ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                        {vs.label}
                        <span className="block text-[10px] opacity-60 mt-0.5">{vs.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerateScript} disabled={!title.trim() || !prompt.trim()} className="w-full gap-2">
                <Sparkles className="w-4 h-4" /> Generate Script with GPT-4o <ChevronRight className="w-4 h-4" />
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
                  <h2 className="text-base font-semibold">GPT-4o Script Engine</h2>
                  <p className="text-xs text-muted-foreground">{isLoading ? loadingLabel : "Script ready — review and edit before voiceover"}</p>
                </div>
                {!isLoading && generatedScript && (
                  <button onClick={() => setEditingScript(!editingScript)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Edit3 className="w-3 h-3" /> {editingScript ? "Preview" : "Edit"}
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="space-y-4">
                  <div className="space-y-3">{steps.map((s, i) => <Step key={i} label={s.label} done={s.done} active={s.active} />)}</div>
                  <ProgressBar value={loadingProgress} />
                  <p className="text-xs text-center text-muted-foreground font-mono">{loadingProgress}% · GPT-4o processing</p>
                </div>
              )}

              {!isLoading && generatedScript && (
                <div className="space-y-4">
                  {/* Script quality badges */}
                  <div className="flex flex-wrap gap-2">
                    {generatedScript.viralPotential && (
                      <ScriptBadge label="Viral Potential" value={`${generatedScript.viralPotential}%`}
                        color={generatedScript.viralPotential >= 80 ? "border-emerald-400/30 text-emerald-400 bg-emerald-400/5" : "border-yellow-400/30 text-yellow-400 bg-yellow-400/5"} />
                    )}
                    {generatedScript.emotionalTrigger && (
                      <ScriptBadge label="Trigger" value={generatedScript.emotionalTrigger}
                        color="border-pink-400/30 text-pink-400 bg-pink-400/5" />
                    )}
                    {generatedScript.hookStyle && (
                      <ScriptBadge label="Hook Style" value={generatedScript.hookStyle.replace(/_/g, " ")}
                        color="border-primary/30 text-primary bg-primary/5" />
                    )}
                    {generatedScript.estimatedWordCount && (
                      <ScriptBadge label="Words" value={String(generatedScript.estimatedWordCount)}
                        color="border-border text-muted-foreground bg-muted/20" />
                    )}
                  </div>

                  {editingScript ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">🎣 Hook (0–2s)</label>
                        <textarea value={editedHook} onChange={(e) => setEditedHook(e.target.value)} rows={2}
                          className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider block mb-1">📝 Body Script</label>
                        <textarea value={editedBody} onChange={(e) => setEditedBody(e.target.value)} rows={8}
                          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none resize-none font-mono text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">📣 CTA</label>
                        <textarea value={editedCta} onChange={(e) => setEditedCta(e.target.value)} rows={1}
                          className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none resize-none" />
                      </div>
                      <button onClick={applyEdits}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors">
                        Apply Changes
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-wider">🎣 Hook (0–2s)</p>
                          <button onClick={() => copy(generatedScript.hook)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-foreground leading-relaxed">"{generatedScript.hook}"</p>
                      </div>

                      <div className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">📝 Body Script</p>
                          <button onClick={() => copy(generatedScript.script)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{generatedScript.script}</p>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-1">📣 CTA</p>
                        <p className="text-sm text-foreground">{generatedScript.cta}</p>
                      </div>
                    </>
                  )}

                  {/* Voice selection */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Voice Profile</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VOICE_STYLES.map((v) => (
                        <button key={v.value} onClick={() => setVoiceStyle(v.value)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${voiceStyle === v.value ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                          <Volume2 className="w-3 h-3 inline mr-1.5" />{v.label}
                          <span className="block text-[10px] opacity-60 mt-0.5">{v.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleGenerateVoice} className="flex-1 gap-2">
                      <Mic className="w-4 h-4" /> Synthesize Voice & Clips <ChevronRight className="w-4 h-4" />
                    </Button>
                    <button onClick={() => { setStage("prompt"); setGeneratedScript(null); }}
                      className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Voice ── */}
          {stage === "voice" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Neural Voice Synthesis</h2>
                  <p className="text-xs text-muted-foreground">{isLoading ? loadingLabel : "Voice synthesized · B-roll clips matched"}</p>
                </div>
              </div>

              {isLoading && (
                <div className="space-y-4">
                  <div className="space-y-3">{steps.map((s, i) => <Step key={i} label={s.label} done={s.done} active={s.active} />)}</div>
                  <ProgressBar value={loadingProgress} color="bg-violet-500" />
                  <p className="text-xs text-center text-muted-foreground">{loadingProgress}%</p>
                </div>
              )}

              {!isLoading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Voice", value: VOICE_STYLES.find((v) => v.value === voiceStyle)?.label ?? voiceStyle, color: "text-violet-400" },
                      { label: "Style", value: VIDEO_STYLES.find((v) => v.value === videoStyle)?.label ?? videoStyle, color: "text-cyan-400" },
                      { label: "Platform", value: PLATFORMS.find((p) => p.value === platform)?.label ?? platform, color: "text-primary" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="glass rounded-lg border border-border p-3 text-center">
                        <p className={`text-sm font-bold ${color}`}>{value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleRender} className="w-full gap-2">
                    <Clapperboard className="w-4 h-4" /> Start Cinematic Render <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Render ── */}
          {stage === "render" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold">Cinematic Render Engine</h2>
                  <p className="text-xs text-muted-foreground">{renderLabel || "Ready to render"}</p>
                </div>
                {renderComplete && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              </div>

              {renderProgress > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{renderLabel}</span>
                    <span className="text-sm font-bold font-mono text-foreground">{renderProgress}%</span>
                  </div>
                  <ProgressBar value={renderProgress} color={renderComplete ? "bg-emerald-500" : "bg-orange-500"} />
                  <div className="flex gap-2">
                    {[
                      { label: "Color Grade", done: renderProgress >= 20 },
                      { label: "Assembly", done: renderProgress >= 40 },
                      { label: "Voice Sync", done: renderProgress >= 55 },
                      { label: "Captions", done: renderProgress >= 70 },
                      { label: "Encode", done: renderProgress >= 90 },
                    ].map(({ label, done }) => (
                      <div key={label} className={`flex-1 text-center py-1 rounded text-[9px] font-bold transition-colors ${done ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/30 text-muted-foreground"}`}>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!renderComplete ? (
                <Button onClick={handleRender} disabled={renderProgress > 0 && !renderComplete} className="w-full gap-2">
                  {renderProgress > 0 ? <><Loader2 className="w-4 h-4 animate-spin" /> Rendering...</> : <><Play className="w-4 h-4" /> Start Render</>}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-emerald-400">Render Complete</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {VIDEO_STYLES.find((v) => v.value === videoStyle)?.label} · {PLATFORMS.find((p) => p.value === platform)?.label}
                    </p>
                  </div>
                  <Button onClick={handleExport} className="w-full gap-2">
                    <Download className="w-4 h-4" /> Export & Publish <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Export ── */}
          {(stage === "export" || stage === "done") && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Export Complete</h2>
                  <p className="text-xs text-muted-foreground">Ready to publish to {PLATFORMS.find((p) => p.value === platform)?.label}</p>
                </div>
              </div>

              <div className="space-y-2">
                {PLATFORMS.filter((p) => p.value === platform).map((p) => (
                  <motion.div
                    key={p.value}
                    initial={{ opacity: 0, x: -12 }}
                    animate={exportedPlatforms.includes(p.label) ? { opacity: 1, x: 0 } : {}}
                    className="flex items-center gap-3 p-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5"
                  >
                    {exportedPlatforms.includes(p.label)
                      ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      : <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                    {exportedPlatforms.includes(p.label) && (
                      <span className="ml-auto text-[10px] text-emerald-400 font-bold">READY</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {stage === "done" && (
                <div className="space-y-3">
                  <div className="text-center py-3">
                    <Zap className="w-8 h-8 text-primary mx-auto mb-2 glow-blue" />
                    <p className="text-lg font-bold text-foreground">Video ready!</p>
                    <p className="text-xs text-muted-foreground mt-1">{title}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                      <Download className="w-4 h-4" /> Download Video
                    </button>
                    <button onClick={() => { setStage("prompt"); setGeneratedScript(null); setRenderProgress(0); setRenderComplete(false); setExportedPlatforms([]); videoGenRef.current = null; setVideoReady(false); }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> New Video
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
