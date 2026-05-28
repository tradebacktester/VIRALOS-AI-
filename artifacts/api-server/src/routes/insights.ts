import { Router } from "express";
import { db } from "@workspace/db";
import { learningInsightsTable, commentInsightsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { runSelfOptimizerAgent } from "../agents/self-optimizer-agent.js";
import { runCommentAgent } from "../agents/comment-agent.js";

const router = Router();

router.get("/", async (_req, res) => {
  const insights = await db.select().from(learningInsightsTable)
    .orderBy(desc(learningInsightsTable.confidence))
    .limit(50);
  res.json(insights);
});

router.post("/optimize", async (req, res) => {
  const { projectId, analytics } = req.body as {
    projectId?: number;
    analytics?: Record<string, unknown>[];
  };

  const result = await runSelfOptimizerAgent(projectId, analytics);
  res.json(result);
});

router.patch("/:id", async (req, res) => {
  const { isActive, appliedCount } = req.body as { isActive?: boolean; appliedCount?: number };
  const [updated] = await db.update(learningInsightsTable)
    .set({ isActive, appliedCount, updatedAt: new Date() })
    .where(eq(learningInsightsTable.id, Number(req.params.id)))
    .returning();
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await db.delete(learningInsightsTable).where(eq(learningInsightsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/comments", async (_req, res) => {
  const insights = await db.select().from(commentInsightsTable)
    .orderBy(desc(commentInsightsTable.createdAt)).limit(20);
  res.json(insights);
});

router.post("/comments/analyze", async (req, res) => {
  const { comments, projectId, platform } = req.body as {
    comments: Array<{ text: string; likes?: number }>;
    projectId?: number;
    platform?: string;
  };

  const result = await runCommentAgent(comments ?? [], projectId, platform ?? "tiktok");
  res.json(result);
});

export default router;
