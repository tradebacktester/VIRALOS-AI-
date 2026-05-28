import { Router } from "express";
import { db } from "@workspace/db";
import { contentCalendarTable, contentSeriesTable } from "@workspace/db";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { runCalendarAgent, runSeriesAgent } from "../agents/calendar-agent.js";

const router = Router();

router.get("/", async (req, res) => {
  const { from, to } = req.query as { from?: string; to?: string };
  let query = db.select().from(contentCalendarTable);
  const rows = await db.select().from(contentCalendarTable).orderBy(desc(contentCalendarTable.date)).limit(100);
  res.json(rows);
});

router.post("/generate", async (req, res) => {
  const { niche, platforms, daysAhead = 14, goal } = req.body as {
    niche: string; platforms?: string[]; daysAhead?: number; goal?: string;
  };
  if (!niche) { res.status(400).json({ error: "niche required" }); return; }

  const result = await runCalendarAgent(
    niche,
    platforms ?? ["tiktok", "youtube_shorts", "reels"],
    daysAhead,
    goal
  );
  res.json(result);
});

router.patch("/:id", async (req, res) => {
  const { isPosted, isGenerated, projectId, scheduledPostId } = req.body as {
    isPosted?: boolean; isGenerated?: boolean; projectId?: number; scheduledPostId?: number;
  };
  const [updated] = await db.update(contentCalendarTable)
    .set({ isPosted, isGenerated, projectId, scheduledPostId })
    .where(eq(contentCalendarTable.id, Number(req.params.id)))
    .returning();
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await db.delete(contentCalendarTable).where(eq(contentCalendarTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/series", async (_req, res) => {
  const series = await db.select().from(contentSeriesTable).orderBy(desc(contentSeriesTable.createdAt));
  res.json(series);
});

router.post("/series/generate", async (req, res) => {
  const { niche, platform, targetEpisodes } = req.body as {
    niche: string; platform?: string; targetEpisodes?: number;
  };
  if (!niche) { res.status(400).json({ error: "niche required" }); return; }

  const result = await runSeriesAgent(niche, platform ?? "tiktok", targetEpisodes ?? 10);
  res.json(result);
});

router.delete("/series/:id", async (req, res) => {
  await db.delete(contentSeriesTable).where(eq(contentSeriesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
