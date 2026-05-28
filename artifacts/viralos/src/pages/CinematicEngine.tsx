import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Zap, Layers, Camera, Music2, ImageIcon, Cpu, Play, Pause,
  ChevronRight, Sparkles, Flame, Star, Eye, Triangle, Circle,
  Square, Pentagon, Hexagon, Wand2, Gauge, BarChart2, Crosshair,
  SlidersHorizontal, Activity, RadioTower, Lightbulb, Atom, Wind,
  Aperture, Focus, Move, RotateCw, Maximize2, Minimize2, Upload,
  Download, RefreshCw, Check, X, Plus, Minus, Lock, Unlock,
  Volume2, Waves, Swords, Crown, Ghost, Car, Dumbbell,
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
  },
  {
    id: "sigma-edit",
    name: "Sigma Edit",
    icon: Star,
    color: "#6366f1",
    accent: "#818cf8",
    glow: "rgba(99,102,241,0.6)",
    tags: ["Cold Grade", "Slow Motion", "Echo", "Distortion"],
    description: "Cold cinematic grading, dramatic slow motion, echo trails, and motivational overlays",
    effects: ["coldGrade", "slowMotion", "echoTrail", "vignette"],
    cameraStyle: "Cinematic Push",
    moodColor: "#080816",
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
  },
  {
    id: "trailer-style",
    name: "Trailer Style",
    icon: Film,
    color: "#0f172a",
    accent: "#e2e8f0",
    glow: "rgba(226,232,240,0.4)",
    tags: ["Cinematic Bars", "Lens Flare", "Epic Score", "Teal & Orange"],
    description: "Cinematic letterbox, Hollywood teal-orange grading, massive lens flares, and epic pacing",
    effects: ["letterbox", "lensFlare", "tealOrange", "epicZoom"],
    cameraStyle: "Epic Cinematic",
    moodColor: "#020617",
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
  { id: "chromaticAber", name: "Chromatic Aberration", category: "Distortion", icon: Eye, intensity: 45 },
  { id: "vignette", name: "Vignette", category: "Optical", icon: Circle, intensity: 35 },
  { id: "filmGrain", name: "Film Grain", category: "Texture", icon: Square, intensity: 30 },
  { id: "auraGlow", name: "Aura Glow", category: "Energy", icon: Sparkles, intensity: 85 },
];

const CAMERA_PRESETS = [
  { id: "push-in", name: "Cinematic Push-In", desc: "Slow dramatic zoom toward subject", icon: Maximize2, value: "push" },
  { id: "pull-out", name: "Epic Pull-Out", desc: "Reveal scale with distance", icon: Minimize2, value: "pull" },
  { id: "orbit", name: "Orbit Shot", desc: "Circle around the subject 360°", icon: RotateCw, value: "orbit" },
  { id: "drone", name: "Drone Ascend", desc: "Rise upward revealing environment", icon: Triangle, value: "drone" },
  { id: "handheld", name: "Handheld Raw", desc: "Natural handheld movement energy", icon: Move, value: "handheld" },
  { id: "whip-pan", name: "Whip Pan", desc: "Lightning fast directional cut", icon: ChevronRight, value: "whip" },
  { id: "focus-pull", name: "Focus Pull", desc: "Rack focus from blur to sharp", icon: Focus, value: "focus" },
  { id: "shake", name: "Intensity Shake", desc: "High-energy impact camera shake", icon: Activity, value: "shake" },
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

function ParticleCanvas({ preset }: { preset: (typeof STYLE_PRESETS)[0] | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number }>
  >([]);

  const getColor = useCallback(() => {
    if (!preset) return "#3b82f6";
    return preset.color;
  }, [preset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
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
        hue: Math.random() * 30 - 15,
      });
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.4) spawnParticle();
      if (particlesRef.current.length > 200) particlesRef.current.shift();

      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = `rgba(${r},${g},${b},${alpha * 0.5})`;
        if (p.life >= p.maxLife) particlesRef.current.splice(i, 1);
      });

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 80;
      const barW = canvas.width / bars;
      tRef.current += active ? 0.06 : 0.01;

      for (let i = 0; i < bars; i++) {
        const freq = i / bars;
        const wave1 = Math.sin(tRef.current * 3 + i * 0.3) * 0.5 + 0.5;
        const wave2 = Math.sin(tRef.current * 7 + i * 0.15) * 0.3 + 0.3;
        const bass = i < 15 ? Math.sin(tRef.current * 2 + i * 0.5) * 0.8 + 0.2 : 0;
        const h = canvas.height * (wave1 * 0.4 + wave2 * 0.3 + bass * 0.3) * (active ? 1 : 0.3);
        const alpha = active ? 0.9 : 0.3;
        const hue = 200 + freq * 60;
        ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${alpha})`;
        ctx.fillRect(i * barW + 1, canvas.height - h, barW - 2, h);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

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

function EffectLayerCard({
  effect,
  active,
  onToggle,
  onIntensity,
}: {
  effect: (typeof EFFECTS_LIBRARY)[0];
  active: boolean;
  onToggle: () => void;
  onIntensity: (v: number) => void;
}) {
  const [intensity, setIntensity] = useState(effect.intensity);
  const [locked, setLocked] = useState(false);
  const Icon = effect.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
        active
          ? "border-primary/40 bg-primary/8 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
          : "border-white/5 bg-white/3 hover:border-white/10"
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
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
            value={intensity}
            onChange={(e) => {
              const v = Number(e.target.value);
              setIntensity(v);
              onIntensity(v);
            }}
            className="w-full h-1 accent-primary"
          />
        )}
      </div>
      {active && (
        <button
          onClick={() => setLocked((l) => !l)}
          className="text-muted-foreground hover:text-foreground"
        >
          {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>
      )}
    </motion.div>
  );
}

export default function CinematicEngine() {
  const [activeTab, setActiveTab] = useState<"studio" | "scene-ai" | "camera" | "music" | "thumbnail" | "render">("studio");
  const [selectedPreset, setSelectedPreset] = useState<(typeof STYLE_PRESETS)[0]>(STYLE_PRESETS[0]);
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set(["motionBlur", "auraGlow", "glitch"]));
  const [selectedCamera, setSelectedCamera] = useState("push-in");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<typeof SCENE_ANALYSIS_DEMO | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [renderQueue, setRenderQueue] = useState([
    { id: 1, name: "MMA Intro Sequence", preset: "MMA Motivation", status: "rendering", progress: 67 },
    { id: 2, name: "Anime AMV — Opening", preset: "Dark Anime", status: "queued", progress: 0 },
    { id: 3, name: "Luxury Reel v2", preset: "Hyper Luxury", status: "complete", progress: 100 },
  ]);
  const [selectedCamera2, setSelectedCamera2] = useState(CAMERA_PRESETS[0]);
  const [thumbnailGenerating, setThumbnailGenerating] = useState(false);
  const [thumbnailDone, setThumbnailDone] = useState(false);
  const [beatDrops, setBeatDrops] = useState([12, 28, 44, 60, 76, 92]);
  const [syncEnabled, setSyncEnabled] = useState(true);

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

  const toggleEffect = (id: string) => {
    setActiveEffects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
            {[["Preset", selectedPreset.name], ["Active FX", `${activeEffects.size}`], ["Camera", selectedCamera2.name]].map(([k, v]) => (
              <div key={k} className="text-center">
                <p className="text-foreground font-bold text-[11px]">{v}</p>
                <p className="text-muted-foreground">{k}</p>
              </div>
            ))}
          </div>
          <button className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors">
            <Zap className="w-3.5 h-3.5" />
            Apply to Video
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Live Preview Canvas */}
        <div className="w-72 shrink-0 border-r border-white/5 flex flex-col">
          {/* Canvas preview */}
          <div className="relative h-48 overflow-hidden bg-black border-b border-white/5">
            <ParticleCanvas preset={selectedPreset} />
            {/* Preset overlay info */}
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
            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />
          </div>

          {/* Preset List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
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
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${preset.color}20`, border: `1px solid ${preset.color}40` }}
                  >
                    <Icon className="w-3 h-3" style={{ color: preset.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-foreground truncate">{preset.name}</p>
                    <p className="text-[9px] text-muted-foreground">{preset.cameraStyle}</p>
                  </div>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: preset.color, boxShadow: `0 0 6px ${preset.color}` }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Center: Tab Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="border-b border-white/5 px-4 flex items-center gap-1 shrink-0 bg-black/20">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold border-b-2 transition-all ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
            <AnimatePresence mode="wait">
              {activeTab === "studio" && (
                <motion.div key="studio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Preset description */}
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${selectedPreset.color}20`, border: `1px solid ${selectedPreset.color}30` }}>
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

                  {/* Effect metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <GlowMeter value={87} color={selectedPreset.color} label="Cinematic" />
                    <GlowMeter value={92} color={selectedPreset.accent} label="Energy" />
                    <GlowMeter value={79} color="#22d3ee" label="Retention" />
                  </div>

                  {/* Effect Stack */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Effect Stack</h3>
                      <span className="text-[10px] text-muted-foreground">{activeEffects.size} active</span>
                    </div>
                    <div className="space-y-1.5">
                      {EFFECTS_LIBRARY.map((effect) => (
                        <EffectLayerCard
                          key={effect.id}
                          effect={effect}
                          active={activeEffects.has(effect.id)}
                          onToggle={() => toggleEffect(effect.id)}
                          onIntensity={(v) => {}}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

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
                        className="px-4 py-2 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
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
                          transition={{ delay: i * 0.4 }}
                          className="flex items-center gap-2 text-[11px] text-muted-foreground"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin text-primary shrink-0" />
                          {step}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {analysisResult && (
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
                  )}
                </motion.div>
              )}

              {activeTab === "camera" && (
                <motion.div key="camera" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">AI Camera Engine</h3>
                    <p className="text-[11px] text-muted-foreground mb-4">Simulate cinematic camera moves on any static footage — the AI applies realistic physics and timing.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CAMERA_PRESETS.map((cam) => {
                        const Icon = cam.icon;
                        const active = selectedCamera2.id === cam.id;
                        return (
                          <motion.button
                            key={cam.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCamera2(cam)}
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
                    {[
                      { label: "Shake Intensity", default: 40 },
                      { label: "Zoom Speed", default: 65 },
                      { label: "Motion Blur", default: 55 },
                      { label: "Lens Distortion", default: 30 },
                      { label: "Focus Pull Speed", default: 70 },
                    ].map((param) => (
                      <div key={param.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{param.label}</span>
                          <span className="text-[10px] text-foreground font-bold">{param.default}%</span>
                        </div>
                        <input type="range" min={0} max={100} defaultValue={param.default} className="w-full h-1 accent-primary" />
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
                    <div className="flex items-start gap-2">
                      <Crosshair className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-cyan-400">Subject Tracking Active</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">AI will lock onto the primary subject and simulate realistic camera tracking throughout the clip.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "music" && (
                <motion.div key="music" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Music FX Synchronizer</h3>
                      <button
                        onClick={() => setMusicPlaying((p) => !p)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          musicPlaying ? "bg-primary text-white" : "bg-white/10 text-muted-foreground hover:bg-white/15"
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
                      <span>Waveform analysis · {beatDrops.length} beat drops detected</span>
                      <div className="ml-auto flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${musicPlaying ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                        <span>{musicPlaying ? "Analyzing" : "Paused"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Beat Sync Points</h4>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground">Auto-sync</span>
                        <button
                          onClick={() => setSyncEnabled((e) => !e)}
                          className={`w-8 h-4 rounded-full transition-all relative ${syncEnabled ? "bg-primary" : "bg-white/10"}`}
                        >
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${syncEnabled ? "left-4" : "left-0.5"}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {beatDrops.map((beat, i) => (
                        <div key={i} className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold">
                          {beat}s
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Sync Effects to Beats</h4>
                    {[
                      { label: "Flash on Beat Drop", enabled: true, color: "#f87171" },
                      { label: "Zoom on Bass Hit", enabled: true, color: "#60a5fa" },
                      { label: "Caption Pop on Downbeat", enabled: false, color: "#a78bfa" },
                      { label: "Particle Burst on Snare", enabled: true, color: "#34d399" },
                      { label: "Camera Shake on Drop", enabled: false, color: "#fbbf24" },
                      { label: "Speed Ramp on Build", enabled: true, color: "#f472b6" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-[11px] text-foreground">{item.label}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${item.enabled ? "text-emerald-400" : "text-muted-foreground"}`}>
                          {item.enabled ? "ON" : "OFF"}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "thumbnail" && (
                <motion.div key="thumbnail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-2">AI Thumbnail FX Generator</h3>
                    <p className="text-[11px] text-muted-foreground">AI generates high-CTR cinematic thumbnails with 3D typography, glow, and emotional composition.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["MrBeast Style", "Anime Edit", "Luxury Motivation", "Cinematic Trailer"].map((style) => (
                      <button key={style} className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:border-primary/30 transition-all text-[11px] text-foreground font-bold text-left">
                        {style}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "3D Typography Depth", default: 75 },
                      { label: "Glow Intensity", default: 85 },
                      { label: "Background Blur", default: 60 },
                      { label: "Color Contrast Boost", default: 70 },
                    ].map((p) => (
                      <div key={p.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{p.label}</span>
                          <span className="text-[10px] text-foreground font-bold">{p.default}%</span>
                        </div>
                        <input type="range" min={0} max={100} defaultValue={p.default} className="w-full h-1 accent-primary" />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={generateThumbnail}
                    disabled={thumbnailGenerating}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-sm font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {thumbnailGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {thumbnailGenerating ? "Generating Cinematic Thumbnail..." : "Generate Thumbnail FX"}
                  </button>

                  {thumbnailDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-emerald-400">Thumbnail Generated</p>
                        <p className="text-[10px] text-muted-foreground">Predicted CTR boost: +340% · Ready to export</p>
                      </div>
                      <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/25 transition-colors">
                        <Download className="w-3 h-3" /> Export
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === "render" && (
                <motion.div key="render" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "GPU Cores", value: "8×", color: "#60a5fa" },
                      { label: "Queue", value: `${renderQueue.length}`, color: "#a78bfa" },
                      { label: "Avg Time", value: "2.4m", color: "#34d399" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-xl border border-white/5 bg-white/2 text-center">
                        <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Render Queue</h3>
                    {renderQueue.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl border border-white/5 bg-white/2 space-y-2">
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
                            {item.status}
                          </span>
                        </div>
                        {item.status !== "queued" && (
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full rounded-full ${item.status === "complete" ? "bg-emerald-400" : "bg-primary"}`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
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

                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-sm font-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Start GPU Render · 4K Export
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Stats Panel */}
        <div className="w-64 shrink-0 border-l border-white/5 flex flex-col bg-black/20">
          <div className="p-3 border-b border-white/5">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">AI Decision Engine</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
            {/* Current AI decisions */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Decisions</p>
              {[
                { label: "When", value: "Beat drop + emotional peak", icon: Activity },
                { label: "How much", value: "87% intensity — high energy", icon: Gauge },
                { label: "Which FX", value: selectedPreset.tags[0], icon: Sparkles },
                { label: "Camera", value: selectedCamera2.name, icon: Camera },
                { label: "Pacing", value: "Cut every 1.8s avg", icon: Film },
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

            {/* Preset metrics */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Predicted Output</p>
              {[
                { label: "Virality Score", value: 94, color: "#f87171" },
                { label: "Retention Rate", value: 89, color: "#60a5fa" },
                { label: "CTR Boost", value: "+340%", raw: true, color: "#34d399" },
                { label: "Cinematic Score", value: 97, color: "#a78bfa" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  <span className="text-[11px] font-black" style={{ color: m.color }}>
                    {m.raw ? m.value : `${m.value}%`}
                  </span>
                </div>
              ))}
            </div>

            {/* Active FX summary */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active FX ({activeEffects.size})</p>
              {EFFECTS_LIBRARY.filter((e) => activeEffects.has(e.id)).map((e) => {
                const Icon = e.icon;
                return (
                  <div key={e.id} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-primary/5 border border-primary/15">
                    <Icon className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-[10px] text-foreground">{e.name}</span>
                  </div>
                );
              })}
              {activeEffects.size === 0 && (
                <p className="text-[10px] text-muted-foreground italic">No effects active</p>
              )}
            </div>

            {/* Director intelligence */}
            <div className="p-2.5 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1">Director Mode</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                AI is behaving as a <span className="text-violet-400 font-bold">Hollywood Trailer Editor</span> combined with a <span className="text-violet-400 font-bold">TikTok Viral Specialist</span>. Output will be emotionally addictive and algorithm-optimized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
