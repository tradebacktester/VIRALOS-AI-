export interface AgentContext {
  projectId?: number;
  prompt?: string;
  platform?: string;
  niche?: string;
  memories?: AgentMemoryEntry[];
  [key: string]: unknown;
}

export interface AgentMemoryEntry {
  key: string;
  content: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface AgentLog {
  agent: string;
  timestamp: string;
  message: string;
  data?: unknown;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  logs: AgentLog[];
  tokensUsed?: number;
}

export interface StoryboardScene {
  scene: string;
  camera_motion: string;
  emotion: string;
  visual_style: string;
  duration_sec?: number;
  color_palette?: string;
}

export interface HookVariant {
  hook: string;
  style: string;
  predicted_retention: number;
  emotional_trigger: string;
  rank: number;
}

export interface EmotionArc {
  timestamp: string;
  emotion: string;
  intensity: number;
  type: "buildup" | "spike" | "release" | "tension";
}

export interface ViralityBreakdown {
  viral_probability: number;
  hook_score: number;
  emotion_score: number;
  curiosity_gap: number;
  replay_potential: number;
  retention_prediction: "low" | "medium" | "high" | "very_high";
  shareability: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface TrendSignal {
  topic: string;
  platform: string;
  momentum: "rising" | "peaking" | "declining";
  emotional_pattern: string;
  format: string;
  aesthetic: string;
  estimated_reach: string;
}

export interface ContentPillar {
  name: string;
  description: string;
  content_types: string[];
  posting_frequency: string;
}

export interface PostingSchedule {
  day: string;
  time: string;
  platform: string;
  content_type: string;
}
