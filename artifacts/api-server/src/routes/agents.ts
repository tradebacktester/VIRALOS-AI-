import { Router } from "express";
import { orchestrateAgents, type OrchestratorMode } from "../agents/orchestrator.js";
import { runTrendAgent } from "../agents/trend-agent.js";
import { runHookAgent } from "../agents/hook-agent.js";
import { runContentStrategyAgent } from "../agents/content-strategy-agent.js";
import { runJarvis, type JarvisMessage } from "../agents/jarvis-agent.js";
import { db } from "@workspace/db";
import { agentRunsTable, agentMemoriesTable, viralityScoresTable, trendReportsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.post("/run", async (req, res) => {
  const { projectId, prompt, platform, niche, mode = "full_pipeline" } = req.body as {
    projectId?: number;
    prompt?: string;
    platform?: string;
    niche?: string;
    mode?: OrchestratorMode;
  };

  if (!prompt && !projectId) {
    res.status(400).json({ error: "prompt or projectId required" });
    return;
  }

  const result = await orchestrateAgents({ projectId, prompt, platform, niche }, mode);
  res.json(result);
});

router.post("/run/stream", async (req, res) => {
  const { projectId, prompt, platform, niche, mode = "full_pipeline" } = req.body as {
    projectId?: number;
    prompt?: string;
    platform?: string;
    niche?: string;
    mode?: OrchestratorMode;
  };

  if (!prompt && !projectId) {
    res.status(400).json({ error: "prompt or projectId required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("status", { message: "Initializing agent pipeline...", agent: "JARVIS", timestamp: new Date().toISOString() });

  const agentSteps = [
    { agent: "Trend Agent", message: "Scanning platform trends and viral signals..." },
    { agent: "Hook Agent", message: "Engineering 10 hook variations for maximum retention..." },
    { agent: "Emotion Agent", message: "Mapping emotional arc and dopamine spike points..." },
    { agent: "Visual Director", message: "Composing cinematic storyboard and color strategy..." },
    { agent: "Retention Agent", message: "Analyzing pacing, detecting dead zones, inserting pattern interrupts..." },
    { agent: "Caption Agent", message: "Generating multi-style caption sets..." },
    { agent: "Virality Engine", message: "Computing viral probability across 6 dimensions..." },
    { agent: "AI Memory", message: "Storing high-performance patterns to memory bank..." },
  ];

  const interval = setInterval(() => {
    const step = agentSteps.shift();
    if (step) {
      send("agent_activity", { ...step, timestamp: new Date().toISOString() });
    }
  }, 800);

  try {
    const result = await orchestrateAgents({ projectId, prompt, platform, niche }, mode);

    clearInterval(interval);

    for (const log of result.allLogs) {
      send("agent_activity", log);
    }

    send("result", result);
    send("done", { status: result.status, runId: result.runId });
  } catch (err) {
    clearInterval(interval);
    send("error", { message: err instanceof Error ? err.message : "Unknown error" });
  } finally {
    res.end();
  }
});

router.post("/hooks", async (req, res) => {
  const { prompt, platform, niche } = req.body as { prompt: string; platform?: string; niche?: string };
  if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }
  const result = await runHookAgent(prompt, platform, niche);
  res.json(result);
});

router.post("/trends/scan", async (req, res) => {
  const { platforms } = req.body as { platforms?: string[] };
  const result = await runTrendAgent(platforms);

  if (result.success && result.data) {
    const today = new Date().toISOString().split("T")[0];
    await db.insert(trendReportsTable).values({
      reportDate: today,
      risingTrends: result.data.risingTrends ?? [],
      viralSounds: result.data.viralSounds ?? [],
      emotionalPatterns: result.data.emotionalPatterns ?? [],
      highRetentionFormats: result.data.highRetentionFormats ?? [],
      trendingAesthetics: result.data.trendingAesthetics ?? [],
      platformBreakdown: result.data.platformBreakdown ?? {},
    });
  }

  res.json(result);
});

router.get("/trends/reports", async (_req, res) => {
  const reports = await db.select().from(trendReportsTable).orderBy(desc(trendReportsTable.createdAt)).limit(10);
  res.json(reports);
});

router.post("/strategy", async (req, res) => {
  const { niche, goal, platforms } = req.body as { niche: string; goal: string; platforms?: string[] };
  if (!niche || !goal) { res.status(400).json({ error: "niche and goal required" }); return; }
  const result = await runContentStrategyAgent(niche, goal, platforms);
  res.json(result);
});

router.get("/strategies", async (_req, res) => {
  const { contentStrategiesTable } = await import("@workspace/db");
  const strategies = await db.select().from(contentStrategiesTable).orderBy(desc(contentStrategiesTable.createdAt)).limit(20);
  res.json(strategies);
});

router.get("/runs", async (req, res) => {
  const { projectId } = req.query as { projectId?: string };
  const runs = projectId
    ? await db.select().from(agentRunsTable).where(eq(agentRunsTable.projectId, Number(projectId))).orderBy(desc(agentRunsTable.createdAt)).limit(20)
    : await db.select().from(agentRunsTable).orderBy(desc(agentRunsTable.createdAt)).limit(20);
  res.json(runs);
});

router.get("/runs/:id", async (req, res) => {
  const rows = await db.select().from(agentRunsTable).where(eq(agentRunsTable.id, Number(req.params.id))).limit(1);
  if (!rows.length) { res.status(404).json({ error: "Run not found" }); return; }
  res.json(rows[0]);
});

router.get("/virality/:projectId", async (req, res) => {
  const rows = await db.select().from(viralityScoresTable)
    .where(eq(viralityScoresTable.projectId, Number(req.params.projectId)))
    .orderBy(desc(viralityScoresTable.createdAt))
    .limit(1);
  if (!rows.length) { res.status(404).json({ error: "No virality score yet" }); return; }
  res.json(rows[0]);
});

router.get("/virality", async (_req, res) => {
  const rows = await db.select().from(viralityScoresTable).orderBy(desc(viralityScoresTable.createdAt)).limit(50);
  res.json(rows);
});

router.get("/memory/:agentType", async (req, res) => {
  const rows = await db.select().from(agentMemoriesTable)
    .where(eq(agentMemoriesTable.agentType, req.params.agentType))
    .orderBy(desc(agentMemoriesTable.score), desc(agentMemoriesTable.updatedAt))
    .limit(20);
  res.json(rows);
});

router.get("/memory", async (_req, res) => {
  const rows = await db.select().from(agentMemoriesTable)
    .orderBy(desc(agentMemoriesTable.score), desc(agentMemoriesTable.updatedAt))
    .limit(100);
  res.json(rows);
});

router.delete("/memory/:agentType/:key", async (req, res) => {
  await db.delete(agentMemoriesTable)
    .where(and(
      eq(agentMemoriesTable.agentType, req.params.agentType),
      eq(agentMemoriesTable.memoryKey, req.params.key)
    ));
  res.json({ success: true });
});

router.post("/jarvis", async (req, res) => {
  const { messages, context } = req.body as {
    messages: JarvisMessage[];
    context?: { niche?: string; platform?: string; projectId?: number };
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const result = await runJarvis(messages, context);
  res.json(result);
});

router.post("/jarvis/stream", async (req, res) => {
  const { messages, context } = req.body as {
    messages: JarvisMessage[];
    context?: { niche?: string; platform?: string };
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("status", { message: "JARVIS online. Processing your command...", timestamp: new Date().toISOString() });

  try {
    const result = await runJarvis(messages, context);
    if (result.data) {
      send("reply", result.data);
    }
    send("done", { success: true });
  } catch (err) {
    send("error", { message: err instanceof Error ? err.message : "Unknown error" });
  } finally {
    res.end();
  }
});

export default router;
