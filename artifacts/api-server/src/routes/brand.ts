import { Router } from "express";
import { db } from "@workspace/db";
import { brandIdentitiesTable, channelsTable, renderQueueTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { runBrandAgent, runPsychologyAgent, runUniverseAgent } from "../agents/brand-agent.js";

const router = Router();

router.get("/brands", async (_req, res) => {
  const brands = await db.select().from(brandIdentitiesTable).orderBy(desc(brandIdentitiesTable.createdAt)).limit(20);
  res.json(brands);
});

router.post("/brands/create", async (req, res) => {
  const { prompt } = req.body as { prompt: string };
  if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }
  const result = await runBrandAgent(prompt);
  res.json(result);
});

router.get("/brands/:id", async (req, res) => {
  const [brand] = await db.select().from(brandIdentitiesTable).where(eq(brandIdentitiesTable.id, Number(req.params.id))).limit(1);
  if (!brand) { res.status(404).json({ error: "Not found" }); return; }
  res.json(brand);
});

router.delete("/brands/:id", async (req, res) => {
  await db.delete(brandIdentitiesTable).where(eq(brandIdentitiesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/channels", async (_req, res) => {
  const channels = await db.select().from(channelsTable).orderBy(desc(channelsTable.createdAt));
  res.json(channels);
});

router.post("/channels", async (req, res) => {
  const { name, niche, platform, handle, contentPillar, psychTarget, styleProfileId, brandId } = req.body as {
    name: string; niche: string; platform: string; handle?: string;
    contentPillar?: string; psychTarget?: string; styleProfileId?: number; brandId?: number;
  };
  if (!name || !niche || !platform) { res.status(400).json({ error: "name, niche, platform required" }); return; }
  const [ch] = await db.insert(channelsTable).values({
    name, niche, platform, handle, contentPillar, psychTarget,
    styleProfileId, brandId, status: "active",
  }).returning();
  res.json(ch);
});

router.patch("/channels/:id", async (req, res) => {
  const { status, followersCount, avgViews, monthlyRevenue } = req.body as {
    status?: string; followersCount?: string; avgViews?: string; monthlyRevenue?: string;
  };
  const [updated] = await db.update(channelsTable)
    .set({ status, followersCount, avgViews, monthlyRevenue })
    .where(eq(channelsTable.id, Number(req.params.id))).returning();
  res.json(updated);
});

router.delete("/channels/:id", async (req, res) => {
  await db.delete(channelsTable).where(eq(channelsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.post("/psychology", async (req, res) => {
  const { topic, targetEmotion, platform } = req.body as {
    topic: string; targetEmotion: string; platform?: string;
  };
  if (!topic || !targetEmotion) { res.status(400).json({ error: "topic and targetEmotion required" }); return; }
  const result = await runPsychologyAgent(topic, targetEmotion, platform ?? "tiktok");
  res.json(result);
});

router.get("/universes", async (_req, res) => {
  const { storyUniversesTable } = await import("@workspace/db");
  const universes = await db.select().from(storyUniversesTable).orderBy(desc(storyUniversesTable.createdAt));
  res.json(universes);
});

router.post("/universes/create", async (req, res) => {
  const { niche, universeTheme, episodeCount } = req.body as {
    niche: string; universeTheme: string; episodeCount?: number;
  };
  if (!niche || !universeTheme) { res.status(400).json({ error: "niche and universeTheme required" }); return; }
  const result = await runUniverseAgent(niche, universeTheme, episodeCount ?? 12);
  res.json(result);
});

router.delete("/universes/:id", async (req, res) => {
  const { storyUniversesTable } = await import("@workspace/db");
  await db.delete(storyUniversesTable).where(eq(storyUniversesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/queue", async (_req, res) => {
  const tasks = await db.select().from(renderQueueTable).orderBy(desc(renderQueueTable.createdAt)).limit(50);
  const summary = {
    queued: tasks.filter((t) => t.status === "queued").length,
    processing: tasks.filter((t) => t.status === "processing").length,
    done: tasks.filter((t) => t.status === "done").length,
    failed: tasks.filter((t) => t.status === "failed").length,
    totalCostCredits: tasks.reduce((s, t) => s + (t.costCredits ?? 0), 0),
    cacheHitRate: tasks.length > 0 ? tasks.filter((t) => t.cachedResult).length / tasks.length : 0,
    tasks,
  };
  res.json(summary);
});

router.post("/queue/add", async (req, res) => {
  const { taskType, projectId, priority, estimatedMs, costCredits } = req.body as {
    taskType: string; projectId?: number; priority?: number; estimatedMs?: number; costCredits?: number;
  };
  const [task] = await db.insert(renderQueueTable).values({
    taskType, projectId,
    priority: priority ?? 5,
    status: "queued",
    estimatedMs: estimatedMs ?? 3000,
    costCredits: costCredits ?? 0.02,
    cachedResult: false,
    gpuAssigned: `gpu-${Math.floor(Math.random() * 4) + 1}`,
  }).returning();
  res.json(task);
});

export default router;
