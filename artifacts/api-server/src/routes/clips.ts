import { Router } from "express";
import { db, clipsTable, clipJobsTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SearchClipsBody, GenerateAiClipBody } from "@workspace/api-zod";

const router = Router();

const STOCK_CLIP_TEMPLATES = [
  { source: "pexels", emotionTag: "cinematic" },
  { source: "pixabay", emotionTag: "energy" },
  { source: "pexels", emotionTag: "dramatic" },
  { source: "unsplash", emotionTag: "aesthetic" },
];

router.post("/search", async (req, res) => {
  const parsed = SearchClipsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { projectId, query, emotionTone, count = 4 } = parsed.data;

  const clips = [];
  for (let i = 0; i < Math.min(count, 4); i++) {
    const template = STOCK_CLIP_TEMPLATES[i % STOCK_CLIP_TEMPLATES.length];
    const [row] = await db
      .insert(clipsTable)
      .values({
        projectId,
        source: template.source,
        url: `https://player.vimeo.com/external/clip_${projectId}_${i}`,
        thumbnailUrl: `https://picsum.photos/seed/${projectId}${i}/640/360`,
        duration: 5 + Math.floor(Math.random() * 10),
        query,
        emotionTag: emotionTone ?? template.emotionTag,
      })
      .returning();
    clips.push(row);
  }

  await db
    .update(projectsTable)
    .set({ status: "editing", progress: 50 })
    .where(eq(projectsTable.id, projectId));

  res.json(clips);
});

router.post("/generate", async (req, res) => {
  const parsed = GenerateAiClipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { projectId, description: _description, duration: _duration, provider = "runway" } = parsed.data;

  const [row] = await db
    .insert(clipJobsTable)
    .values({
      projectId,
      status: "processing",
      provider,
    })
    .returning();

  res.json(row);
});

router.get("/:projectId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const rows = await db
    .select()
    .from(clipsTable)
    .where(eq(clipsTable.projectId, projectId));
  res.json(rows);
});

export default router;
