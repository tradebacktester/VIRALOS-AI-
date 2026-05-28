import { Router } from "express";
import { db, exportJobsTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GenerateExportsBody } from "@workspace/api-zod";

const router = Router();

const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  youtube_shorts: { width: 1080, height: 1920 },
  tiktok: { width: 1080, height: 1920 },
  reels: { width: 1080, height: 1920 },
  x_clips: { width: 1280, height: 720 },
};

router.post("/generate", async (req, res) => {
  const parsed = GenerateExportsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { projectId, platforms } = parsed.data;
  const jobs = [];

  for (const platform of platforms) {
    const dims = PLATFORM_DIMENSIONS[platform] ?? { width: 1080, height: 1920 };
    const [existing] = await db
      .select()
      .from(exportJobsTable)
      .where(eq(exportJobsTable.projectId, projectId));

    let row;
    if (existing && existing.platform === platform) {
      [row] = await db
        .update(exportJobsTable)
        .set({
          status: "done",
          downloadUrl: `/api/exports/${platform}_${projectId}.mp4`,
          width: dims.width,
          height: dims.height,
          fileSizeBytes: 15000000,
        })
        .where(eq(exportJobsTable.id, existing.id))
        .returning();
    } else {
      [row] = await db
        .insert(exportJobsTable)
        .values({
          projectId,
          platform,
          status: "done",
          downloadUrl: `/api/exports/${platform}_${projectId}.mp4`,
          width: dims.width,
          height: dims.height,
          fileSizeBytes: 15000000,
        })
        .returning();
    }
    jobs.push(row);
  }

  await db
    .update(projectsTable)
    .set({ status: "done", progress: 100 })
    .where(eq(projectsTable.id, projectId));

  res.json(jobs);
});

router.get("/:projectId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const rows = await db
    .select()
    .from(exportJobsTable)
    .where(eq(exportJobsTable.projectId, projectId));
  res.json(rows);
});

export default router;
