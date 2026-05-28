import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateProject,
  useGenerateScript,
  useGenerateVoiceover,
  useSearchClips,
  useRenderVideo,
  useGenerateExports,
  getListProjectsQueryKey,
  getGetRecentProjectsQueryKey,
} from "@workspace/api-client-react";
import type { ProjectInputPlatform, VoiceoverInputVoiceStyle } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Wand2,
  FileText,
  Mic,
  Film,
  Clapperboard,
  Download,
  CheckCircle,
  Loader2,
  ChevronRight,
  Zap,
} from "lucide-react";

const PLATFORMS = [
  { value: "youtube_shorts", label: "YouTube Shorts", aspect: "9:16" },
  { value: "tiktok", label: "TikTok", aspect: "9:16" },
  { value: "reels", label: "Instagram Reels", aspect: "9:16" },
  { value: "x_clips", label: "X / Twitter", aspect: "16:9" },
  { value: "all", label: "All Platforms", aspect: "Multi" },
];

const VOICE_STYLES = [
  { value: "motivational_male", label: "Motivational Male" },
  { value: "motivational_female", label: "Motivational Female" },
  { value: "dramatic_male", label: "Dramatic Male" },
  { value: "dramatic_female", label: "Dramatic Female" },
  { value: "calm_male", label: "Calm Male" },
  { value: "calm_female", label: "Calm Female" },
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

export default function CreateVideo() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [stage, setStage] = useState<StageKey>("prompt");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<ProjectInputPlatform>("all");
  const [voiceStyle, setVoiceStyle] = useState<VoiceoverInputVoiceStyle>("motivational_male");
  const [generatedScript, setGeneratedScript] = useState<{ hook: string; script: string; cta: string } | null>(null);

  const createProject = useCreateProject();
  const generateScript = useGenerateScript();
  const generateVoiceover = useGenerateVoiceover();
  const searchClips = useSearchClips();
  const renderVideo = useRenderVideo();
  const generateExports = useGenerateExports();

  const stageIndex = PIPELINE_STAGES.findIndex((s) => s.key === stage);

  async function handleStart() {
    if (!title.trim() || !prompt.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    try {
      const project = await createProject.mutateAsync({
        data: { title, prompt, platform: platform as ProjectInputPlatform },
      });
      setProjectId(project.id);
      setStage("script");
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentProjectsQueryKey() });

      // Auto-generate script
      const script = await generateScript.mutateAsync({
        data: { projectId: project.id, prompt, platform },
      });
      setGeneratedScript({ hook: script.hook, script: script.script, cta: script.cta });
    } catch {
      toast({ title: "Failed to create project", variant: "destructive" });
    }
  }

  async function handleGenerateVoice() {
    if (!projectId) return;
    try {
      setStage("voice");
      await generateVoiceover.mutateAsync({
        data: { projectId, text: generatedScript?.script ?? prompt, voiceStyle },
      });
      setStage("clips");

      // Auto find clips
      await searchClips.mutateAsync({
        data: { projectId, query: prompt, count: 4 },
      });
      setStage("render");
    } catch {
      toast({ title: "Voiceover or clip search failed", variant: "destructive" });
    }
  }

  async function handleRender() {
    if (!projectId) return;
    try {
      await renderVideo.mutateAsync({
        data: { projectId, transitionStyle: "cinematic", backgroundMusic: true, autoZoom: true },
      });
      setStage("export");
    } catch {
      toast({ title: "Render failed", variant: "destructive" });
    }
  }

  async function handleExport() {
    if (!projectId) return;
    try {
      const platformsToExport = platform === "all"
        ? ["youtube_shorts", "tiktok", "reels", "x_clips"]
        : [platform];
      await generateExports.mutateAsync({
        data: { projectId, platforms: platformsToExport },
      });
      setStage("done");
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentProjectsQueryKey() });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  }

  const isLoading =
    createProject.isPending ||
    generateScript.isPending ||
    generateVoiceover.isPending ||
    searchClips.isPending ||
    renderVideo.isPending ||
    generateExports.isPending;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Video</h1>
        <p className="text-sm text-muted-foreground mt-0.5">From prompt to viral-ready content in minutes</p>
      </div>

      {/* Pipeline progress */}
      <div className="glass rounded-xl border border-border p-4">
        <div className="flex items-center gap-1">
          {PIPELINE_STAGES.map((s, i) => {
            const Icon = s.icon;
            const done = i < stageIndex || stage === "done";
            const active = s.key === stage;
            const pending = i > stageIndex;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    done ? "bg-emerald-500/20 border border-emerald-500/50" :
                    active ? "bg-primary/20 border border-primary glow-blue" :
                    "bg-muted border border-border"
                  }`}>
                    {done ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : active && isLoading ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? "text-primary" : done ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className={`h-px flex-1 mb-5 transition-all duration-500 ${i < stageIndex ? "bg-emerald-500/50" : "bg-border"}`} />
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
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          {stage === "prompt" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Define your video</h2>
                  <p className="text-xs text-muted-foreground">Enter a single prompt — AI handles everything else</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Project Title</label>
                  <Input
                    data-testid="input-project-title"
                    placeholder="e.g. The Discipline Framework"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Prompt</label>
                  <textarea
                    data-testid="input-prompt"
                    placeholder="e.g. Why most people fail at building discipline and how to fix it in 30 days"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Target Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.value}
                        data-testid={`button-platform-${p.value}`}
                        onClick={() => setPlatform(p.value as ProjectInputPlatform)}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                          platform === p.value
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                        }`}
                      >
                        <div>{p.label}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">{p.aspect}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                data-testid="button-generate-script"
                onClick={handleStart}
                disabled={isLoading || !title.trim() || !prompt.trim()}
                className="w-full gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isLoading ? "Generating Script..." : "Generate Script"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {stage === "script" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">AI Script</h2>
                  <p className="text-xs text-muted-foreground">Your viral-optimized script is ready</p>
                </div>
              </div>

              {isLoading && !generatedScript ? (
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-4 bg-muted rounded animate-pulse`} style={{ width: `${70 + i * 5}%` }} />
                  ))}
                </div>
              ) : generatedScript ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-1">Hook</p>
                    <p className="text-sm font-medium text-foreground">{generatedScript.hook}</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Script</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{generatedScript.script}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider mb-1">CTA</p>
                    <p className="text-sm text-foreground">{generatedScript.cta}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Voice Style</label>
                    <select
                      data-testid="select-voice-style"
                      value={voiceStyle}
                      onChange={(e) => setVoiceStyle(e.target.value as VoiceoverInputVoiceStyle)}
                      className="w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {VOICE_STYLES.map((v) => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    data-testid="button-generate-voice"
                    onClick={handleGenerateVoice}
                    disabled={isLoading}
                    className="w-full gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                    {isLoading ? "Generating Voice + Finding Clips..." : "Generate Voiceover"}
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {(stage === "voice" || stage === "clips") && (
            <div className="glass rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  {stage === "voice" ? <Mic className="w-4 h-4 text-purple-400" /> : <Film className="w-4 h-4 text-yellow-400" />}
                </div>
                <div>
                  <h2 className="text-base font-semibold">{stage === "voice" ? "Generating Voiceover" : "Finding Clips"}</h2>
                  <p className="text-xs text-muted-foreground">AI is working...</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  stage === "voice" ? "Connecting to ElevenLabs voice API" : "Searching Pexels & Pixabay",
                  stage === "voice" ? "Synthesizing with emotional pacing" : "Matching semantic relevance",
                  stage === "voice" ? "Adding dramatic pauses" : "Detecting cinematic quality",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === "render" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Auto Video Editor</h2>
                  <p className="text-xs text-muted-foreground">FFmpeg rendering engine ready</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "Cinematic transitions",
                  "Beat-sync cuts",
                  "Auto zoom effects",
                  "Background music",
                  "Caption overlay",
                  "Motion blur",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                data-testid="button-render"
                onClick={handleRender}
                disabled={renderVideo.isPending}
                className="w-full gap-2"
              >
                {renderVideo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
                {renderVideo.isPending ? "Rendering..." : "Start Render"}
              </Button>
            </div>
          )}

          {stage === "export" && (
            <div className="glass rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Platform Export</h2>
                  <p className="text-xs text-muted-foreground">Optimized for each platform's specs</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { p: "YouTube Shorts", dim: "1080 × 1920", format: "MP4 H.264" },
                  { p: "TikTok", dim: "1080 × 1920", format: "MP4 H.265" },
                  { p: "Instagram Reels", dim: "1080 × 1920", format: "MP4 H.264" },
                  { p: "X / Twitter", dim: "1280 × 720", format: "MP4 H.264" },
                ].map((exp) => (
                  <div key={exp.p} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-card border border-border">
                    <span className="text-sm font-medium text-foreground">{exp.p}</span>
                    <span className="text-xs text-muted-foreground">{exp.dim} · {exp.format}</span>
                  </div>
                ))}
              </div>
              <Button
                data-testid="button-export"
                onClick={handleExport}
                disabled={generateExports.isPending}
                className="w-full gap-2"
              >
                {generateExports.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {generateExports.isPending ? "Exporting..." : "Export All Platforms"}
              </Button>
            </div>
          )}

          {stage === "done" && (
            <div className="glass rounded-xl border border-emerald-500/30 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto glow-blue">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Video Complete</h2>
                <p className="text-sm text-muted-foreground mt-1">Your content is ready for all platforms</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  data-testid="button-view-project"
                  onClick={() => setLocation(`/projects/${projectId}`)}
                  className="gap-2"
                >
                  View Project
                </Button>
                <Button
                  data-testid="button-create-another"
                  variant="outline"
                  onClick={() => {
                    setStage("prompt");
                    setProjectId(null);
                    setTitle("");
                    setPrompt("");
                    setGeneratedScript(null);
                  }}
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
