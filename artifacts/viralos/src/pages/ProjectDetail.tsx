import { useParams } from "wouter";
import { motion } from "framer-motion";
import {
  useGetProject,
  useGetScript,
  useGetVoiceover,
  useListProjectClips,
  useGetVideoStatus,
  useListExports,
  getGetProjectQueryKey,
  getGetScriptQueryKey,
  getGetVoiceoverQueryKey,
  getListProjectClipsQueryKey,
  getGetVideoStatusQueryKey,
  getListExportsQueryKey,
} from "@workspace/api-client-react";
import { FileText, Mic, Film, Clapperboard, Download, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  youtube_shorts: "YouTube Shorts",
  tiktok: "TikTok",
  reels: "Instagram Reels",
  x_clips: "X / Twitter",
  all: "All Platforms",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    done: { color: "text-emerald-400 bg-emerald-400/15", icon: <CheckCircle className="w-3 h-3" /> },
    processing: { color: "text-blue-400 bg-blue-400/15", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    queued: { color: "text-yellow-400 bg-yellow-400/15", icon: <Clock className="w-3 h-3" /> },
    failed: { color: "text-destructive bg-destructive/15", icon: <AlertCircle className="w-3 h-3" /> },
  };
  const s = map[status] ?? map["queued"];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${s.color}`}>
      {s.icon}
      {status}
    </span>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: project, isLoading } = useGetProject(id, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) },
  });
  const { data: script } = useGetScript(id, {
    query: { enabled: !!id, queryKey: getGetScriptQueryKey(id) },
  });
  const { data: voiceover } = useGetVoiceover(id, {
    query: { enabled: !!id, queryKey: getGetVoiceoverQueryKey(id) },
  });
  const { data: clips } = useListProjectClips(id, {
    query: { enabled: !!id, queryKey: getListProjectClipsQueryKey(id) },
  });
  const { data: renderJob } = useGetVideoStatus(id, {
    query: { enabled: !!id, queryKey: getGetVideoStatusQueryKey(id) },
  });
  const { data: exports } = useListExports(id, {
    query: { enabled: !!id, queryKey: getListExportsQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const PROGRESS_STAGES = [
    { label: "Script", done: !!script, icon: FileText },
    { label: "Voiceover", done: !!voiceover && voiceover.status === "done", icon: Mic },
    { label: "Clips", done: !!clips && clips.length > 0, icon: Film },
    { label: "Render", done: !!renderJob && renderJob.status === "done", icon: Clapperboard },
    { label: "Export", done: !!exports && exports.length > 0 && exports.some(e => e.status === "done"), icon: Download },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-project-title">{project.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{project.prompt}</p>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {PLATFORM_LABELS[project.platform]}
          </span>
        </div>

        {/* Overall progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">{project.status.replace(/_/g, " ").toUpperCase()}</span>
            <span className="text-primary font-semibold">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Stage indicators */}
          <div className="flex items-center gap-2 mt-3">
            {PROGRESS_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.label} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${stage.done ? "bg-emerald-500/20" : "bg-muted"}`}>
                    {stage.done ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Icon className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-[10px] ${stage.done ? "text-emerald-400" : "text-muted-foreground"}`}>{stage.label}</span>
                  {i < PROGRESS_STAGES.length - 1 && <span className="text-border mx-1">·</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Script */}
        <motion.div variants={item} className="glass rounded-xl border border-border p-5 space-y-3" data-testid="card-script">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold">Script</h3>
          </div>
          {script ? (
            <div className="space-y-2">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <p className="text-[10px] text-primary font-medium uppercase mb-1">Hook</p>
                <p className="text-xs text-foreground">{script.hook}</p>
              </div>
              <div className="bg-card rounded-lg p-2.5">
                <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Platform Style</p>
                <p className="text-xs text-foreground/70">{script.platformStyle}</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-2.5">
                <p className="text-[10px] text-accent-foreground font-medium uppercase mb-1">CTA</p>
                <p className="text-xs text-foreground">{script.cta}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not generated yet</p>
          )}
        </motion.div>

        {/* Voiceover */}
        <motion.div variants={item} className="glass rounded-xl border border-border p-5 space-y-3" data-testid="card-voiceover">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold">Voiceover</h3>
          </div>
          {voiceover ? (
            <div className="space-y-2">
              <StatusBadge status={voiceover.status} />
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Style: <span className="text-foreground">{voiceover.voiceStyle.replace(/_/g, " ")}</span></span>
                {voiceover.durationMs && (
                  <span>Duration: <span className="text-foreground">{(voiceover.durationMs / 1000).toFixed(1)}s</span></span>
                )}
              </div>
              {voiceover.audioUrl && (
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Audio ready</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not generated yet</p>
          )}
        </motion.div>

        {/* Clips */}
        <motion.div variants={item} className="glass rounded-xl border border-border p-5 space-y-3" data-testid="card-clips">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold">Clips ({clips?.length ?? 0})</h3>
          </div>
          {clips && clips.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {clips.map((clip) => (
                <div key={clip.id} className="rounded-lg overflow-hidden bg-card border border-border" data-testid={`img-clip-${clip.id}`}>
                  <img src={clip.thumbnailUrl} alt="" className="w-full h-16 object-cover" />
                  <div className="px-2 py-1">
                    <p className="text-[10px] text-muted-foreground capitalize">{clip.source}</p>
                    {clip.emotionTag && <p className="text-[10px] text-primary">{clip.emotionTag}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No clips yet</p>
          )}
        </motion.div>

        {/* Render + Exports */}
        <motion.div variants={item} className="glass rounded-xl border border-border p-5 space-y-3" data-testid="card-render">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold">Render & Exports</h3>
          </div>
          {renderJob ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={renderJob.status} />
                {renderJob.stage && <span className="text-xs text-muted-foreground">{renderJob.stage.replace(/_/g, " ")}</span>}
              </div>
              {renderJob.status === "processing" && (
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-1/2 animate-pulse" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not rendered yet</p>
          )}

          {exports && exports.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Exports</p>
              {exports.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between" data-testid={`row-export-${exp.id}`}>
                  <span className="text-xs text-foreground capitalize">{exp.platform.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{exp.width}×{exp.height}</span>
                    <StatusBadge status={exp.status} />
                    {exp.downloadUrl && exp.status === "done" && (
                      <a href={exp.downloadUrl} className="p-1 rounded hover:bg-muted transition-colors">
                        <Download className="w-3 h-3 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
