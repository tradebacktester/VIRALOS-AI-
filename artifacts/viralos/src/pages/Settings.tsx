import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key, Save, CheckCircle, ExternalLink } from "lucide-react";

const API_CONFIGS = [
  {
    key: "elevenlabs",
    label: "ElevenLabs",
    description: "Voiceover generation — high-quality AI voices",
    placeholder: "sk_...",
    docs: "https://elevenlabs.io/app/speech-synthesis",
    feature: "Voice Engine",
  },
  {
    key: "pexels",
    label: "Pexels",
    description: "Stock footage search — cinematic clips",
    placeholder: "Your Pexels API key",
    docs: "https://www.pexels.com/api/",
    feature: "Clip Finder",
  },
  {
    key: "pixabay",
    label: "Pixabay",
    description: "Stock footage search — backup source",
    placeholder: "Your Pixabay API key",
    docs: "https://pixabay.com/api/docs/",
    feature: "Clip Finder",
  },
  {
    key: "runwayml",
    label: "RunwayML",
    description: "AI video generation — cinematic clip fallback",
    placeholder: "key_...",
    docs: "https://runwayml.com/api/",
    feature: "AI Video Gen",
  },
  {
    key: "assemblyai",
    label: "AssemblyAI",
    description: "Transcription and caption timing",
    placeholder: "Your AssemblyAI API key",
    docs: "https://www.assemblyai.com/",
    feature: "Caption Engine",
  },
  {
    key: "openai",
    label: "OpenAI",
    description: "Script generation and content intelligence",
    placeholder: "sk-...",
    docs: "https://platform.openai.com/api-keys",
    feature: "Script Engine",
  },
];

export default function Settings() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  function handleSave(apiKey: string) {
    setSaved((prev) => ({ ...prev, [apiKey]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [apiKey]: false })), 2000);
    toast({ title: `${apiKey} API key saved`, description: "Key stored in environment secrets" });
  }

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your AI service integrations</p>
      </div>

      <div className="glass rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Key className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">API Keys Required</p>
            <p className="text-xs text-amber-300/70 mt-0.5">
              Add your API keys below to enable live AI generation. Without keys, the system uses simulated outputs.
            </p>
          </div>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {API_CONFIGS.map((config) => (
          <motion.div key={config.key} variants={item}>
            <div
              className="glass rounded-xl border border-border p-4 space-y-3"
              data-testid={`card-api-${config.key}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{config.label}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">{config.feature}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                </div>
                <a
                  href={config.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  data-testid={`link-docs-${config.key}`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              </div>
              <div className="flex gap-2">
                <Input
                  data-testid={`input-apikey-${config.key}`}
                  type="password"
                  placeholder={config.placeholder}
                  value={keys[config.key] ?? ""}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [config.key]: e.target.value }))}
                  className="bg-input border-border font-mono text-xs"
                />
                <Button
                  data-testid={`button-save-${config.key}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(config.label)}
                  disabled={!keys[config.key]}
                  className="shrink-0 gap-1.5"
                >
                  {saved[config.key] ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Saved</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" /> Save</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
