import { Router } from "express";
import { db, renderJobsTable, videosTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RenderVideoBody } from "@workspace/api-zod";

const router = Router();

router.post("/render", async (req, res) => {
  const parsed = RenderVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { projectId } = parsed.data;

  const [existing] = await db
    .select()
    .from(renderJobsTable)
    .where(eq(renderJobsTable.projectId, projectId));

  let row;
  if (existing) {
    [row] = await db
      .update(renderJobsTable)
      .set({ status: "processing", progress: 0, stage: "assembling_clips" })
      .where(eq(renderJobsTable.projectId, projectId))
      .returning();
  } else {
    [row] = await db
      .insert(renderJobsTable)
      .values({
        projectId,
        status: "processing",
        progress: 0,
        stage: "assembling_clips",
      })
      .returning();
  }

  await db
    .update(projectsTable)
    .set({ status: "rendering", progress: 70 })
    .where(eq(projectsTable.id, projectId));

  setTimeout(async () => {
    try {
      await db
        .update(renderJobsTable)
        .set({
          status: "done",
          progress: 100,
          stage: "complete",
          outputUrl: `/api/renders/video_${projectId}.mp4`,
        })
        .where(eq(renderJobsTable.projectId, projectId));

      const [existingVideo] = await db
        .select()
        .from(videosTable)
        .where(eq(videosTable.projectId, projectId));

      if (!existingVideo) {
        await db.insert(videosTable).values({
          projectId,
          url: `/api/renders/video_${projectId}.mp4`,
          thumbnailUrl: `https://picsum.photos/seed/render${projectId}/640/360`,
          platform: "all",
          durationSec: 45,
          fileSizeBytes: 18000000,
        });
      }

      await db
        .update(projectsTable)
        .set({ status: "done", progress: 100 })
        .where(eq(projectsTable.id, projectId));
    } catch {}
  }, 3000);

  res.json(row);
});

router.get("/:projectId/status", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const [row] = await db
    .select()
    .from(renderJobsTable)
    .where(eq(renderJobsTable.projectId, projectId));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

router.get("/:projectId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const [row] = await db
    .select()
    .from(videosTable)
    .where(eq(videosTable.projectId, projectId));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

export default router;
