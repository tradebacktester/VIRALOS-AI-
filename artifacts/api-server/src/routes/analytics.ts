import { Router } from "express";
import { db, projectsTable, exportJobsTable, renderJobsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { viralityScoresTable, agentRunsTable, agentMemoriesTable, trendReportsTable } from "@workspace/db";

const router = Router();

router.get("/dashboard", async (req, res) => {
  const projects = await db.select().from(projectsTable);
  const totalProjects = projects.length;
  const videosGenerated = projects.filter((p) => p.status === "done").length;
  const inProgress = projects.filter((p) =>
    ["scripting", "voicing", "finding_clips", "editing", "rendering"].includes(p.status)
  ).length;

  const exports = await db.select().from(exportJobsTable);
  const exportsReady = exports.filter((e) => e.status === "done").length;

  const doneProjects = projects.filter((p) => p.status === "done").length;
  const notFailedProjects = projects.filter((p) => p.status !== "failed").length;
  const successRate = notFailedProjects > 0 ? (doneProjects / notFailedProjects) * 100 : 0;

  const totalDurationSec = videosGenerated * 45;

  res.json({
    totalProjects,
    videosGenerated,
    exportsReady,
    inProgress,
    successRate: Math.round(successRate * 10) / 10,
    totalDurationSec,
  });
});

router.get("/projects/recent", async (req, res) => {
  const rows = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt))
    .limit(10);
  res.json(rows);
});

router.get("/platform-breakdown", async (req, res) => {
  const projects = await db.select().from(projectsTable);
  const platforms = ["youtube_shorts", "tiktok", "reels", "x_clips", "all"];

  const breakdown = platforms.map((platform) => {
    const platformProjects = projects.filter(
      (p) => p.platform === platform || p.platform === "all"
    );
    const done = platformProjects.filter((p) => p.status === "done").length;
    const total = platformProjects.length;
    return {
      platform,
      count: total,
      successRate: total > 0 ? Math.round((done / total) * 1000) / 10 : 0,
    };
  });

  res.json(breakdown);
});

router.get("/virality-history", async (_req, res) => {
  const scores = await db
    .select()
    .from(viralityScoresTable)
    .orderBy(desc(viralityScoresTable.createdAt))
    .limit(30);

  const history = scores.map((s) => ({
    date: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
    viral_probability: s.viralProbability ?? 0,
    hook_score: s.hookScore ?? 0,
    emotion_score: s.emotionScore ?? 0,
    retention_score: s.retentionScore ?? 0,
    shareability: s.shareability ?? 0,
    projectId: s.projectId,
  })).reverse();

  res.json(history);
});

router.get("/emotion-timeline", async (_req, res) => {
  const runs = await db
    .select()
    .from(agentRunsTable)
    .where(sql`${agentRunsTable.output} IS NOT NULL`)
    .orderBy(desc(agentRunsTable.createdAt))
    .limit(20);

  const timeline = runs
    .filter((r) => r.output && typeof r.output === "object")
    .map((r) => {
      const output = r.output as Record<string, unknown>;
      const emotion = output.emotion as Record<string, unknown> | undefined;
      return {
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
        bingeability: emotion?.bingeabilityScore ?? 0,
        replay: emotion?.replayScore ?? 0,
        dopamineSpikes: Array.isArray(emotion?.dopamineSpikes) ? emotion.dopamineSpikes.length : 0,
        runId: r.id,
        projectId: r.projectId,
      };
    }).reverse();

  res.json(timeline);
});

router.get("/memory-stats", async (_req, res) => {
  const memories = await db
    .select()
    .from(agentMemoriesTable)
    .orderBy(desc(agentMemoriesTable.score))
    .limit(200);

  const byAgent: Record<string, { count: number; avgScore: number; topMemory: string }> = {};

  for (const m of memories) {
    if (!byAgent[m.agentType]) {
      byAgent[m.agentType] = { count: 0, avgScore: 0, topMemory: "" };
    }
    byAgent[m.agentType].count++;
    byAgent[m.agentType].avgScore += m.score ?? 0;
    if (!byAgent[m.agentType].topMemory) {
      byAgent[m.agentType].topMemory = m.content.slice(0, 80);
    }
  }

  for (const key of Object.keys(byAgent)) {
    byAgent[key].avgScore = byAgent[key].count > 0
      ? Math.round((byAgent[key].avgScore / byAgent[key].count) * 10) / 10
      : 0;
  }

  const totalMemories = memories.length;
  const avgScore = memories.length > 0
    ? Math.round(memories.reduce((sum, m) => sum + (m.score ?? 0), 0) / memories.length * 10) / 10
    : 0;

  res.json({ byAgent, totalMemories, avgScore });
});

router.get("/trend-heatmap", async (_req, res) => {
  const reports = await db
    .select()
    .from(trendReportsTable)
    .orderBy(desc(trendReportsTable.createdAt))
    .limit(5);

  if (reports.length === 0) {
    res.json({ topics: [], platforms: ["YouTube Shorts", "TikTok", "Reddit", "X/Twitter", "Google"], heatmap: [] });
    return;
  }

  const latest = reports[0];
  const risingTrends = (latest.risingTrends as Array<{ topic: string; platform: string; momentum: string; emotional_pattern: string }>) ?? [];

  const topicMap: Record<string, Record<string, number>> = {};
  const platforms = new Set<string>();

  for (const trend of risingTrends) {
    const topic = trend.topic?.slice(0, 30) ?? "Unknown";
    const platform = trend.platform ?? "All";
    platforms.add(platform);
    if (!topicMap[topic]) topicMap[topic] = {};
    topicMap[topic][platform] = trend.momentum === "rising" ? 3 : trend.momentum === "peaking" ? 2 : 1;
  }

  const topics = Object.keys(topicMap).slice(0, 10);
  const platformList = Array.from(platforms).slice(0, 5);

  const heatmap = topics.map((topic) => ({
    topic,
    values: platformList.map((p) => ({ platform: p, intensity: topicMap[topic][p] ?? 0 })),
  }));

  res.json({ topics, platforms: platformList, heatmap });
});

router.get("/agent-runs-stats", async (_req, res) => {
  const runs = await db.select().from(agentRunsTable).orderBy(desc(agentRunsTable.createdAt)).limit(100);

  const total = runs.length;
  const completed = runs.filter((r) => r.status === "completed").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const byMode: Record<string, number> = {};
  for (const r of runs) {
    byMode[r.runType ?? "unknown"] = (byMode[r.runType ?? "unknown"] ?? 0) + 1;
  }

  const recent = runs.slice(0, 10).map((r) => ({
    id: r.id,
    mode: r.runType,
    status: r.status,
    createdAt: r.createdAt,
    projectId: r.projectId,
  }));

  res.json({ total, completed, failed, byMode, recent });
});

export default router;
