import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Zap, Layers, Camera, Music2, ImageIcon, Cpu, Play, Pause,
  Sparkles, Wand2, Gauge, Crosshair, Activity, RadioTower, Lightbulb,
  Atom, Wind, Aperture, Focus, Move, RotateCw, Maximize2, Minimize2,
  Upload, Download, RefreshCw, Check, Plus, Lock, Unlock, Waves,
  Swords, Crown, Ghost, Car, Dumbbell, Triangle, ChevronRight,
} from "lucide-react";

const STYLE_PRESETS = [
  {
    id: "dark-anime",
    name: "Dark Anime",
    icon: Swords,
    color: "#7c3aed",
    accent: "#a78bfa",
    glow: "rgba(124,58,237,0.6)",
    tags: ["Speed Lines", "Aura Glow", "Impact Frames", "Sakuga"],
    description: "Ultra-fast cuts, speed lines, glowing aura overlays, and anime-style impact frames",
    effects: ["speedLines", "auraGlow", "impactFlash", "motionBlur"],
    cameraStyle: "Explosive Shaky",
    moodColor: "#1a0030",
    virality: 91, energy: 96, retention: 88,
  },
  {
    id: "mma-motivation",
    name: "MMA Motivation",
    icon: Dumbbell,
    color: "#dc2626",
    accent: "#f87171",
    glow: "rgba(220,38,38,0.6)",
    tags: ["Camera Shake", "Impact Flash", "Lens Flare", "Raw Energy"],
    description: "Aggressive cuts, camera shake, impact flashes, and high-energy color grading",
    effects: ["cameraShake", "impactFlash", "lensFlare", "dramaticZoom"],
    cameraStyle: "Handheld Intense",
    moodColor: "#1a0000",
    virality: 94, energy: 98, retention: 85,
  },
  {
    id: "hyper-luxury",
    name: "Hyper Luxury",
    icon: Crown,
    color: "#d97706",
    accent: "#fbbf24",
    glow: "rgba(217,119,6,0.6)",
    tags: ["Gold Particles", "Smooth Motion", "Bokeh", "Ambient Light"],
    description: "Smooth cinematic motion, golden particle rain, soft bokeh, and premium color grading",
    effects: ["goldenParticles", "smoothZoom", "lensDistortion", "colorGrade"],
    cameraStyle: "Silky Drone",
    moodColor: "#1a1000",
    virality: 88, energy: 72, retention: 93,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: Cpu,
    color: "#06b6d4",
    accent: "#22d3ee",
    glow: "rgba(6,182,212,0.6)",
    tags: ["Glitch", "Neon Grid", "Hologram", "Data Rain"],
    description: "Neon glitch effects, holographic overlays, data stream particles, and chromatic aberration",
    effects: ["glitch", "neonGrid", "hologram", "chromaticAberration"],
    cameraStyle: "Digital Orbit",
    moodColor: "#000a1a",
    virality: 89, energy: 87, retention: 82,
  },
  {
    id: "sigma-edit",
    name: "Sigma Edit",
    icon: Sparkles,
    color: "#6366f1",
    accent: "#818cf8",
    glow: "rgba(99,102,241,0.6)",
    tags: ["Cold Grade", "Slow Motion", "Echo", "Distortion"],
    description: "Cold cinematic grading, dramatic slow motion, echo trails, and motivational overlays",
    effects: ["coldGrade", "slowMotion", "echoTrail", "vignette"],
    cameraStyle: "Cinematic Push",
    moodColor: "#080816",
    virality: 92, energy: 78, retention: 90,
  },
  {
    id: "documentary",
    name: "Documentary",
    icon: Film,
    color: "#059669",
    accent: "#34d399",
    glow: "rgba(5,150,105,0.6)",
    tags: ["Film Grain", "Natural Light", "Steady Cam", "Raw"],
    description: "Film grain overlay, natural color grading, steady cam movement, and authentic feel",
    effects: ["filmGrain", "naturalGrade", "steadyCam", "subtleLensFlare"],
    cameraStyle: "Handheld Natural",
    moodColor: "#001a0a",
    virality: 78, energy: 55, retention: 87,
  },
  {
    id: "trailer-style",
    name: "Trailer Style",
    icon: Film,
    color: "#475569",
    accent: "#e2e8f0",
    glow: "rgba(226,232,240,0.4)",
    tags: ["Cinematic Bars", "Lens Flare", "Epic Score", "Teal & Orange"],
    description: "Cinematic letterbox, Hollywood teal-orange grading, massive lens flares, and epic pacing",
    effects: ["letterbox", "lensFlare", "tealOrange", "epicZoom"],
    cameraStyle: "Epic Cinematic",
    moodColor: "#020617",
    virality: 86, energy: 82, retention: 88,
  },
  {
    id: "horror",
    name: "Horror Aesthetic",
    icon: Ghost,
    color: "#7f1d1d",
    accent: "#fca5a5",
    glow: "rgba(127,29,29,0.7)",
    tags: ["Red Tint", "Glitch", "Desaturation", "Flicker"],
    description: "Desaturated red grading, camera flicker, paranoia zoom, and unsettling transitions",
    effects: ["redTint", "flicker", "paranoiaZoom", "desaturate"],
    cameraStyle: "Paranoia Handheld",
    moodColor: "#0f0000",
    virality: 83, energy: 80, retention: 89,
  },
  {
    id: "sports-hype",
    name: "Sports Hype",
    icon: Car,
    color: "#f59e0b",
    accent: "#fcd34d",
    glow: "rgba(245,158,11,0.6)",
    tags: ["Speed Ramp", "Freeze Frame", "Energy Burst", "Score Flash"],
    description: "Speed ramps, freeze frames, energy burst overlays, and hype transitions",
    effects: ["speedRamp", "freezeFrame", "energyBurst", "scoreFlash"],
    cameraStyle: "Dynamic Action",
    moodColor: "#1a0f00",
    virality: 93, energy: 95, retention: 86,
  },
  {
    id: "emotional",
    name: "Emotional Story",
    icon: Sparkles,
    color: "#be185d",
    accent: "#f472b6",
    glow: "rgba(190,24,93,0.6)",
    tags: ["Warm Grade", "Soft Focus", "Memory Blur", "Dust Motes"],
    description: "Warm cinematic grading, soft focus pulls, memory-style blur, and emotional pacing",
    effects: ["warmGrade", "softFocus", "memoryBlur", "dustMotes"],
    cameraStyle: "Emotional Drift",
    moodColor: "#1a0010",
    virality: 90, energy: 60, retention: 95,
  },
];

const EFFECTS_LIBRARY = [
  { id: "motionBlur", name: "Motion Blur", category: "Temporal", icon: Wind, intensity: 75 },
  { id: "depthOfField", name: "Depth of Field", category: "Optical", icon: Focus, intensity: 60 },
  { id: "lensFlare", name: "Lens Flare", category: "Optical", icon: Aperture, intensity: 50 },
  { id: "cameraShake", name: "Camera Shake", category: "Motion", icon: Move, intensity: 40 },
  { id: "speedRamp", name: "Speed Ramp", category: "Temporal", icon: Gauge, intensity: 80 },
  { id: "glitch", name: "Digital Glitch", category: "Distortion", icon: RadioTower, intensity: 65 },
  { id: "particles", name: "Particle System", category: "Generative", icon: Atom, intensity: 55 },
  { id: "volumetricLight", name: "Volumetric Light", category: "Lighting", icon: Lightbulb, intensity: 70 },
  { id: "chromaticAber", name: "Chromatic Aberration", category: "Distortion", icon: Aperture, intensity: 45 },
  { id: "vignette", name: "Vignette", category: "Optical", icon: Film, intensity: 35 },
  { id: "filmGrain", name: "Film Grain", category: "Texture", icon: Layers, intensity: 30 },
  { id: "auraGlow", name: "Aura Glow", category: "Energy", icon: Sparkles, intensity: 85 },
];

const CAMERA_PRESETS = [
  { id: "push-in", name: "Cinematic Push-In", desc: "Slow dramatic zoom toward subject", icon: Maximize2 },
  { id: "pull-out", name: "Epic Pull-Out", desc: "Reveal scale with distance", icon: Minimize2 },
  { id: "orbit", name: "Orbit Shot", desc: "Circle around the subject 360°", icon: RotateCw },
  { id: "drone", name: "Drone Ascend", desc: "Rise upward revealing environment", icon: Triangle },
  { id: "handheld", name: "Handheld Raw", desc: "Natural handheld movement energy", icon: Move },
  { id: "whip-pan", name: "Whip Pan", desc: "Lightning fast directional cut", icon: ChevronRight },
  { id: "focus-pull", name: "Focus Pull", desc: "Rack focus from blur to sharp", icon: Focus },
  { id: "shake", name: "Intensity Shake", desc: "High-energy impact camera shake", icon: Activity },
];

const SCENE_ANALYSIS_DEMO = {
  scene_energy: "EXPLOSIVE",
  emotion: "HYPE / DOMINANCE",
  motion_intensity: 92,
  best_effect_type: "Impact Frames + Speed Lines",
  camera_behavior: "Handheld Intense → Freeze → Slow Push",
  beat_sync: true,
  recommended_preset: "MMA Motivation",
  confidence: 97,
  color_strategy: "Crushed blacks · Boosted reds · Desaturated mids",
  suggested_sfx: ["Bass Whoosh", "Impact Boom", "Energy Ramp Up"],
};

const THUMBNAIL_STYLES = ["MrBeast Style", "Anime Edit", "Luxury Motivation", "Cinematic Trailer"];

function ParticleCanvas({ preset }: { preset: (typeof STYLE_PRESETS)[0] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }>
  >([]);

  const getColor = useCallback(() => preset.color, [preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    particlesRef.current = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth || 288;
      canvas.height = canvas.offsetHeight || 192;
    };
    resize();
    window.addEventListener("resize", resize);

    const color = getColor();
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const spawnParticle = () => {
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      const w = canvas.width, h = canvas.height;
      if (side === 0) { x = Math.random() * w; y = h + 10; }
      else if (side === 1) { x = Math.random() * w; y = -10; }
      else if (side === 2) { x = -10; y = Math.random() * h; }
      else { x = w + 10; y = Math.random() * h; }
      const angle = Math.atan2(h / 2 - y, w / 2 - x) + (Math.random() - 0.5) * 1.5;
      const speed = 0.3 + Math.random() * 1.2;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 120 + Math.random() * 180,
        size: 1 + Math.random() * 3,
      });
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.4) spawnParticle();
      if (particlesRef.current.length > 200) particlesRef.current.shift();

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.5})`;
        ctx.fill();
        if (p.life >= p.maxLife) particlesRef.current.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      const cx = canvas.width / 2, cy = canvas.height / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(cx, cy) * 0.8);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.04)`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [preset, getColor]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function WaveformVisualizer({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const activeRef = useRef(active);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth || 400;
      canvas.height = canvas.offsetHeight || 96;
    };
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 80;
      const barW = canvas.width / bars;
      tRef.current += activeRef.current ? 0.06 : 0.01;

      for (let i = 0; i < bars; i++) {
        const wave1 = Math.sin(tRef.current * 3 + i * 0.3) * 0.5 + 0.5;
        const wave2 = Math.sin(tRef.current * 7 + i * 0.15) * 0.3 + 0.3;
        const bass = i < 15 ? Math.sin(tRef.current * 2 + i * 0.5) * 0.8 + 0.2 : 0;
        const h = canvas.height * (wave1 * 0.4 + wave2 * 0.3 + bass * 0.3) * (activeRef.current ? 1 : 0.3);
        const hue = 200 + (i / bars) * 60;
        ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${activeRef.current ? 0.9 : 0.3})`;
        ctx.fillRect(i * barW + 1, canvas.height - h, barW - 2, h);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

function GlowMeter({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

function ControlSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] text-foreground font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 accent-primary"
      />
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${enabled ? "bg-primary" : "bg-white/10"}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
        style={{ left: enabled ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

function EffectLayerCard({
  effect,
  active,
  intensity,
  onToggle,
  onIntensity,
}: {
  effect: (typeof EFFECTS_LIBRARY)[0];
  active: boolean;
  intensity: number;
  onToggle: () => void;
  onIntensity: (v: number) => void;
}) {
  const [locked, setLocked] = useState(false);
  const Icon = effect.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
        active
          ? "border-primary/40 bg-primary/8 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
          : "border-white/5 bg-white/3 hover:border-white/10"
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
          active ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
        }`}
      >
        {active ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
      </button>
      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-foreground truncate">{effect.name}</span>
          <span className="text-[9px] text-muted-foreground">{effect.category}</span>
        </div>
        {active && (
          <input
            type="range"
            min={0}
            max={100}
            value={locked ? intensity : intensity}
            onChange={(e) => { if (!locked) onIntensity(Number(e.target.value)); }}
            className="w-full h-1 accent-primary cursor-pointer"
          />
        )}
      </div>
      {active && (
        <div className="flex items-center gap-1 shrink-0">
          {active && <span className="text-[9px] text-muted-foreground w-6 text-right">{intensity}</span>}
          <button
            onClick={() => setLocked((l) => !l)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={locked ? "Unlock intensity" : "Lock intensity"}
          >
            {locked ? <Lock className="w-3 h-3 text-primary" /> : <Unlock className="w-3 h-3" />}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function CinematicEngine() {
  const [activeTab, setActiveTab] = useState<"studio" | "scene-ai" | "camera" | "music" | "thumbnail" | "render">("studio");
  const [selectedPreset, setSelectedPreset] = useState(STYLE_PRESETS[0]);
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set(["motionBlur", "auraGlow", "glitch"]));
  const [effectIntensities, setEffectIntensities] = useState<Record<string, number>>(
    Object.fromEntries(EFFECTS_LIBRARY.map((e) => [e.id, e.intensity]))
  );
  const [selectedCamera, setSelectedCamera] = useState(CAMERA_PRESETS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<typeof SCENE_ANALYSIS_DEMO | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [renderQueue, setRenderQueue] = useState([
    { id: 1, name: "MMA Intro Sequence", preset: "MMA Motivation", status: "rendering", progress: 67 },
    { id: 2, name: "Anime AMV — Opening", preset: "Dark Anime", status: "queued", progress: 0 },
    { id: 3, name: "Luxury Reel v2", preset: "Hyper Luxury", status: "complete", progress: 100 },
  ]);
  const [thumbnailGenerating, setThumbnailGenerating] = useState(false);
  const [thumbnailDone, setThumbnailDone] = useState(false);
  const [selectedThumbnailStyle, setSelectedThumbnailStyle] = useState("MrBeast Style");
  const [thumbnailParams, setThumbnailParams] = useState({ depth: 75, glow: 85, blur: 60, contrast: 70 });
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncEffects, setSyncEffects] = useState({
    "Flash on Beat Drop": true,
    "Zoom on Bass Hit": true,
    "Caption Pop on Downbeat": false,
    "Particle Burst on Snare": true,
    "Camera Shake on Drop": false,
    "Speed Ramp on Build": true,
  });
  const [cameraParams, setCameraParams] = useState({ shake: 40, zoom: 65, blur: 55, distortion: 30, focus: 70 });
  const [applyFeedback, setApplyFeedback] = useState(false);
  const [renderRunning, setRenderRunning] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult(SCENE_ANALYSIS_DEMO);
    }, 2800);
  };

  const generateThumbnail = () => {
    setThumbnailGenerating(true);
    setThumbnailDone(false);
    setTimeout(() => {
      setThumbnailGenerating(false);
      setThumbnailDone(true);
    }, 3200);
  };

  const applyToVideo = () => {
    setApplyFeedback(true);
    setTimeout(() => setApplyFeedback(false), 2500);
  };

  const startRender = () => {
    if (renderRunning) return;
    setRenderRunning(true);
    const newItem = {
      id: Date.now(),
      name: `${selectedPreset.name} — Export ${new Date().toLocaleTimeString()}`,
      preset: selectedPreset.name,
      status: "rendering",
      progress: 0,
    };
    setRenderQueue((q) => [newItem, ...q]);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 8 + 3;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setRenderQueue((q) => q.map((item) => item.id === newItem.id ? { ...item, status: "complete", progress: 100 } : item));
        setRenderRunning(false);
      } else {
        setRenderQueue((q) => q.map((item) => item.id === newItem.id ? { ...item, progress: Math.round(prog) } : item));
      }
    }, 400);
  };

  const toggleEffect = (id: string) => {
    setActiveEffects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setEffectIntensity = (id: string, v: number) => {
    setEffectIntensities((prev) => ({ ...prev, [id]: v }));
  };

  const toggleSyncEffect = (label: string) => {
    setSyncEffects((prev) => ({ ...prev, [label]: !prev[label as keyof typeof prev] }));
  };

  const setCameraParam = (key: keyof typeof cameraParams, v: number) => {
    setCameraParams((prev) => ({ ...prev, [key]: v }));
  };

  const avgIntensity = activeEffects.size > 0
    ? Math.round([...activeEffects].reduce((sum, id) => sum + (effectIntensities[id] ?? 50), 0) / activeEffects.size)
    : 0;

  const TABS = [
    { id: "studio", label: "FX Studio", icon: Layers },
    { id: "scene-ai", label: "Scene AI", icon: Cpu },
    { id: "camera", label: "Camera Engine", icon: Camera },
    { id: "music", label: "Music Sync", icon: Music2 },
    { id: "thumbnail", label: "Thumbnail FX", icon: ImageIcon },
    { id: "render", label: "Render Queue", icon: Film },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top HUD Bar */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Film className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-black text-foreground tracking-wider uppercase">Cinematic FX Engine</h1>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase">AI Motion Graphics · Hollywood-Grade</p>
          </div>
          <div className="ml-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold">Engine Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            {[
              ["Preset", selectedPreset.name],
              ["Active FX", `${activeEffects.size}`],
              ["Avg Intensity", `${avgIntensity}%`],
              ["Camera", selectedCamera.name],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <p className="text-foreground font-bold text-[11px]">{v}</p>
                <p className="text-muted-foreground">{k}</p>
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {applyFeedback ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5" /> Applied!
              </motion.div>
            ) : (
              <motion.button
                key="apply"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={applyToVideo}
                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                Apply to Video
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Live Preview Canvas + Preset List */}
        <div className="w-72 shrink-0 border-r border-white/5 flex flex-col">
          <div className="relative h-48 overflow-hidden bg-black border-b border-white/5">
            <ParticleCanvas preset={selectedPreset} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.div
                key={selectedPreset.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-lg font-black tracking-wider uppercase" style={{ color: selectedPreset.accent, textShadow: `0 0 20px ${selectedPreset.glow}` }}>
                  {selectedPreset.name}
                </p>
                <div className="flex gap-1 mt-1 flex-wrap justify-center">
                  {selectedPreset.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[9px] px-2 py-0.5 rounded-full border" style={{ borderColor: `${selectedPreset.accent}40`, color: selectedPreset.accent }}>
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-none">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 py-1">Visual Presets</p>
            {STYLE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active = selectedPreset.id === preset.id;
              return (
                <motion.button
                  key={preset.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPreset(preset)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                    active ? "bg-white/8 border border-white/10" : "hover:bg-white/4"
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${preset.color}20`, border: `1px solid ${preset.color}40` }}>
                    <Icon className="w-3 h-3" style={{ color: preset.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-foreground truncate">{preset.name}</p>
                    <p className="text-[9px] text-muted-foreground">{preset.cameraStyle}</p>
                  </div>
                  {active && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: preset.color, boxShadow: `0 0 6px ${preset.color}` }} />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Center: Tab Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-white/5 px-4 flex items-center gap-1 shrink-0 bg-black/20 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold border-b-2 whitespace-nowrap transition-all ${
                    active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
            <AnimatePresence mode="wait">

              {/* ─── FX Studio ─── */}
              {activeTab === "studio" && (
                <motion.div key="studio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${selectedPreset.color}20`, border: `1px solid ${selectedPreset.color}30` }}>
                        {(() => { const Icon = selectedPreset.icon; return <Icon className="w-5 h-5" style={{ color: selectedPreset.color }} />; })()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-foreground">{selectedPreset.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{selectedPreset.description}</p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {selectedPreset.tags.map((t) => (
                            <span key={t} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${selectedPreset.color}15`, color: selectedPreset.accent, border: `1px solid ${selectedPreset.color}25` }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <GlowMeter value={selectedPreset.virality} color={selectedPreset.color} label="Virality" />
                    <GlowMeter value={selectedPreset.energy} color={selectedPreset.accent} label="Energy" />
                    <GlowMeter value={selectedPreset.retention} color="#22d3ee" label="Retention" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Effect Stack</h3>
                      <span className="text-[10px] text-muted-foreground">{activeEffects.size} / {EFFECTS_LIBRARY.length} active</span>
                    </div>
                    <div className="space-y-1.5">
                      {EFFECTS_LIBRARY.map((effect) => (
                        <EffectLayerCard
                          key={effect.id}
                          effect={effect}
                          active={activeEffects.has(effect.id)}
                          intensity={effectIntensities[effect.id] ?? effect.intensity}
                          onToggle={() => toggleEffect(effect.id)}
                          onIntensity={(v) => setEffectIntensity(effect.id, v)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Scene AI ─── */}
              {activeTab === "scene-ai" && (
                <motion.div key="scene-ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-1">Auto Scene Intelligence</h3>
                    <p className="text-[11px] text-muted-foreground">Upload or link a video clip — the AI analyzes every scene and generates a precise cinematic effect plan.</p>
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 p-3 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[11px] text-muted-foreground gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                        <Upload className="w-4 h-4" /> Drop video or paste URL
                      </div>
                      <button
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
                      >
                        {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                      </button>
                    </div>
                  </div>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      {["Scanning scene energy...", "Mapping emotional arc...", "Detecting motion intensity...", "Calculating beat sync points...", "Selecting optimal FX stack..."].map((step, i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.45 }}
                          className="flex items-center gap-2 text-[11px] text-muted-foreground"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin text-primary shrink-0" />
                          {step}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {analysisResult && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-black text-primary uppercase tracking-widest">Scene Analysis Complete</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">{analysisResult.confidence}% Confidence</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Scene Energy", value: analysisResult.scene_energy, color: "#f87171" },
                            { label: "Emotion", value: analysisResult.emotion, color: "#a78bfa" },
                            { label: "Best FX Type", value: analysisResult.best_effect_type, color: "#60a5fa" },
                            { label: "Camera Behavior", value: analysisResult.camera_behavior, color: "#34d399" },
                          ].map((item) => (
                            <div key={item.label} className="p-2.5 rounded-xl bg-white/3 border border-white/5">
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{item.label}</p>
                              <p className="text-[11px] font-bold mt-0.5" style={{ color: item.color }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 space-y-2">
                          <GlowMeter value={analysisResult.motion_intensity} color="#f87171" label="Motion Intensity" />
                        </div>
                        <div className="mt-3 p-2.5 rounded-xl bg-white/3 border border-white/5">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Color Strategy</p>
                          <p className="text-[11px] text-foreground mt-0.5">{analysisResult.color_strategy}</p>
                        </div>
                        <div className="mt-3">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">Suggested SFX</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {analysisResult.suggested_sfx.map((sfx) => (
                              <span key={sfx} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{sfx}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const p = STYLE_PRESETS.find((p) => p.name === analysisResult.recommended_preset);
                            if (p) setSelectedPreset(p);
                            setActiveTab("studio");
                          }}
                          className="w-full mt-3 py-2 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          Apply Recommended: {analysisResult.recommended_preset}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {!isAnalyzing && !analysisResult && (
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Example Decisions</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Motivational Speech", result: "Dramatic Typography + Slow Push", color: "#6366f1" },
                          { label: "Gym Edit", result: "Impact Flash + Camera Shake", color: "#dc2626" },
                          { label: "Anime Edit", result: "Speed Lines + Glow Aura", color: "#7c3aed" },
                          { label: "Luxury Content", result: "Gold Particles + Ambient Bokeh", color: "#d97706" },
                        ].map((ex) => (
                          <div key={ex.label} className="p-3 rounded-xl border border-white/5 bg-white/2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{ex.label}</p>
                            <p className="text-[11px] font-bold mt-1" style={{ color: ex.color }}>→ {ex.result}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── Camera Engine ─── */}
              {activeTab === "camera" && (
                <motion.div key="camera" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-1">AI Camera Engine</h3>
                    <p className="text-[11px] text-muted-foreground mb-4">Simulate cinematic camera moves on any static footage — the AI applies realistic physics and timing.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CAMERA_PRESETS.map((cam) => {
                        const Icon = cam.icon;
                        const active = selectedCamera.id === cam.id;
                        return (
                          <motion.button
                            key={cam.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCamera(cam)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              active ? "border-primary/40 bg-primary/8" : "border-white/5 bg-white/2 hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-3.5 h-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                              <span className={`text-[11px] font-bold ${active ? "text-primary" : "text-foreground"}`}>{cam.name}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{cam.desc}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2 space-y-3">
                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Camera Parameters</h4>
                    <ControlSlider label="Shake Intensity" value={cameraParams.shake} onChange={(v) => setCameraParam("shake", v)} />
                    <ControlSlider label="Zoom Speed" value={cameraParams.zoom} onChange={(v) => setCameraParam("zoom", v)} />
                    <ControlSlider label="Motion Blur" value={cameraParams.blur} onChange={(v) => setCameraParam("blur", v)} />
                    <ControlSlider label="Lens Distortion" value={cameraParams.distortion} onChange={(v) => setCameraParam("distortion", v)} />
                    <ControlSlider label="Focus Pull Speed" value={cameraParams.focus} onChange={(v) => setCameraParam("focus", v)} />
                  </div>

                  <div className="p-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
                    <div className="flex items-start gap-2">
                      <Crosshair className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-cyan-400">Subject Tracking Active</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          AI locks onto the primary subject with <span className="text-cyan-400 font-bold">{selectedCamera.name}</span> · Shake {cameraParams.shake}% · Zoom {cameraParams.zoom}%
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Music Sync ─── */}
              {activeTab === "music" && (
                <motion.div key="music" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Music FX Synchronizer</h3>
                      <button
                        onClick={() => setMusicPlaying((p) => !p)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          musicPlaying ? "bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]" : "bg-white/10 text-muted-foreground hover:bg-white/15"
                        }`}
                      >
                        {musicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="h-24 rounded-xl overflow-hidden bg-black/40 border border-white/5">
                      <WaveformVisualizer active={musicPlaying} />
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Waves className="w-3 h-3" />
                      <span>Waveform analysis · 6 beat drops detected</span>
                      <div className="ml-auto flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${musicPlaying ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                        <span>{musicPlaying ? "Analyzing" : "Paused"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Beat Sync Points</h4>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground">Auto-sync</span>
                        <Toggle enabled={syncEnabled} onToggle={() => setSyncEnabled((e) => !e)} />
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {[12, 28, 44, 60, 76, 92].map((beat, i) => (
                        <div key={i} className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold">
                          {beat}s
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Sync Effects to Beats</h4>
                    {(Object.entries(syncEffects) as [string, boolean][]).map(([label, enabled], i) => {
                      const colors = ["#f87171", "#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];
                      return (
                        <div
                          key={label}
                          onClick={() => toggleSyncEffect(label)}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/2 cursor-pointer hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                            <span className="text-[11px] text-foreground">{label}</span>
                          </div>
                          <Toggle enabled={enabled} onToggle={() => toggleSyncEffect(label)} />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ─── Thumbnail FX ─── */}
              {activeTab === "thumbnail" && (
                <motion.div key="thumbnail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-2">AI Thumbnail FX Generator</h3>
                    <p className="text-[11px] text-muted-foreground">AI generates high-CTR cinematic thumbnails with 3D typography, glow, and emotional composition.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {THUMBNAIL_STYLES.map((style) => (
                      <motion.button
                        key={style}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setSelectedThumbnailStyle(style); setThumbnailDone(false); }}
                        className={`p-2.5 rounded-xl border transition-all text-[11px] font-bold text-left ${
                          selectedThumbnailStyle === style
                            ? "border-primary/40 bg-primary/8 text-primary"
                            : "border-white/5 bg-white/2 hover:border-white/10 text-foreground"
                        }`}
                      >
                        {style}
                        {selectedThumbnailStyle === style && <span className="ml-1 text-[9px]">✓</span>}
                      </motion.button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <ControlSlider label="3D Typography Depth" value={thumbnailParams.depth} onChange={(v) => setThumbnailParams((p) => ({ ...p, depth: v }))} />
                    <ControlSlider label="Glow Intensity" value={thumbnailParams.glow} onChange={(v) => setThumbnailParams((p) => ({ ...p, glow: v }))} />
                    <ControlSlider label="Background Blur" value={thumbnailParams.blur} onChange={(v) => setThumbnailParams((p) => ({ ...p, blur: v }))} />
                    <ControlSlider label="Color Contrast Boost" value={thumbnailParams.contrast} onChange={(v) => setThumbnailParams((p) => ({ ...p, contrast: v }))} />
                  </div>

                  <button
                    onClick={generateThumbnail}
                    disabled={thumbnailGenerating}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-sm font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {thumbnailGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {thumbnailGenerating ? `Generating ${selectedThumbnailStyle}...` : `Generate: ${selectedThumbnailStyle}`}
                  </button>

                  {thumbnailDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-emerald-400">{selectedThumbnailStyle} — Generated</p>
                        <p className="text-[10px] text-muted-foreground">CTR boost: +{thumbnailParams.glow * 4}% · Depth {thumbnailParams.depth}% · Ready to export</p>
                      </div>
                      <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/25 transition-colors shrink-0">
                        <Download className="w-3 h-3" /> Export
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ─── Render Queue ─── */}
              {activeTab === "render" && (
                <motion.div key="render" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "GPU Cores", value: "8×", color: "#60a5fa" },
                      { label: "In Queue", value: `${renderQueue.filter((r) => r.status !== "complete").length}`, color: "#a78bfa" },
                      { label: "Completed", value: `${renderQueue.filter((r) => r.status === "complete").length}`, color: "#34d399" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-xl border border-white/5 bg-white/2 text-center">
                        <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Render Queue</h3>
                    <AnimatePresence>
                      {renderQueue.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-xl border border-white/5 bg-white/2 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-bold text-foreground">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">{item.preset}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.status === "rendering" ? "bg-primary/15 text-primary"
                              : item.status === "complete" ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/8 text-muted-foreground"
                            }`}>
                              {item.status === "rendering" ? `${item.progress}%` : item.status}
                            </span>
                          </div>
                          {item.status !== "queued" && (
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: `${item.progress}%` }}
                                transition={{ duration: 0.4, ease: "linear" }}
                                className={`h-full rounded-full ${item.status === "complete" ? "bg-emerald-400" : "bg-primary"}`}
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Render Settings</h4>
                    {[
                      { label: "Resolution", value: "4K Ultra HD", color: "#60a5fa" },
                      { label: "Frame Rate", value: "60 FPS", color: "#a78bfa" },
                      { label: "Format", value: "H.265 / ProRes", color: "#34d399" },
                      { label: "Color Space", value: "10-bit HDR", color: "#fbbf24" },
                      { label: "GPU Acceleration", value: "CUDA / Metal", color: "#f472b6" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/2">
                        <span className="text-[11px] text-muted-foreground">{s.label}</span>
                        <span className="text-[11px] font-bold" style={{ color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={startRender}
                    disabled={renderRunning}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-sm font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {renderRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {renderRunning ? "Rendering..." : `Start GPU Render · ${selectedPreset.name} · 4K`}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Right: AI Decision Engine */}
        <div className="w-64 shrink-0 border-l border-white/5 flex flex-col bg-black/20">
          <div className="p-3 border-b border-white/5">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">AI Decision Engine</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Decisions</p>
              {[
                { label: "When", value: syncEnabled ? "Beat drop + emotional peak" : "Scene cuts only", icon: Activity },
                { label: "How much", value: `${avgIntensity}% avg intensity`, icon: Gauge },
                { label: "Which FX", value: activeEffects.size > 0 ? selectedPreset.tags[0] : "No FX active", icon: Sparkles },
                { label: "Camera", value: selectedCamera.name, icon: Camera },
                { label: "Pacing", value: `${Math.max(0.8, (3 - avgIntensity / 50)).toFixed(1)}s avg cut`, icon: Film },
              ].map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="p-2 rounded-lg bg-white/3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="w-3 h-3 text-primary" />
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{d.label}</span>
                    </div>
                    <p className="text-[11px] font-bold text-foreground">{d.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Predicted Output</p>
              {[
                { label: "Virality Score", value: selectedPreset.virality, color: "#f87171" },
                { label: "Retention Rate", value: selectedPreset.retention, color: "#60a5fa" },
                { label: "CTR Boost", value: `+${Math.round(thumbnailParams.glow * 4)}%`, raw: true, color: "#34d399" },
                { label: "Cinematic Score", value: selectedPreset.energy, color: "#a78bfa" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  <span className="text-[11px] font-black" style={{ color: m.color }}>
                    {m.raw ? m.value : `${m.value}%`}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active FX ({activeEffects.size})</p>
              {EFFECTS_LIBRARY.filter((e) => activeEffects.has(e.id)).map((e) => {
                const Icon = e.icon;
                return (
                  <div key={e.id} className="flex items-center justify-between p-1.5 rounded-lg bg-primary/5 border border-primary/15">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-[10px] text-foreground">{e.name}</span>
                    </div>
                    <span className="text-[9px] text-primary font-bold">{effectIntensities[e.id] ?? e.intensity}</span>
                  </div>
                );
              })}
              {activeEffects.size === 0 && (
                <p className="text-[10px] text-muted-foreground italic">No effects active</p>
              )}
            </div>

            <div className="p-2.5 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1">Director Mode</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                AI behaving as a <span className="text-violet-400 font-bold">Hollywood Trailer Editor</span> + <span className="text-violet-400 font-bold">TikTok Viral Specialist</span>. Preset: <span className="text-violet-400 font-bold">{selectedPreset.name}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
