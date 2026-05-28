import { Router } from "express";
import { db, voiceoverJobsTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GenerateVoiceoverBody } from "@workspace/api-zod";

const router = Router();

const VOICE_DURATIONS: Record<string, number> = {
  motivational_male: 45000,
  motivational_female: 47000,
  dramatic_male: 52000,
  dramatic_female: 50000,
  calm_male: 60000,
  calm_female: 58000,
};

router.post("/generate", async (req, res) => {
  const parsed = GenerateVoiceoverBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { projectId, voiceStyle = "motivational_male" } = parsed.data;

  const [existing] = await db
    .select()
    .from(voiceoverJobsTable)
    .where(eq(voiceoverJobsTable.projectId, projectId));

  let row;
  if (existing) {
    [row] = await db
      .update(voiceoverJobsTable)
      .set({
        status: "done",
        voiceStyle,
        audioUrl: `/api/audio/voiceover_${projectId}.mp3`,
        durationMs: VOICE_DURATIONS[voiceStyle] ?? 45000,
      })
      .where(eq(voiceoverJobsTable.projectId, projectId))
      .returning();
  } else {
    [row] = await db
      .insert(voiceoverJobsTable)
      .values({
        projectId,
        status: "done",
        voiceStyle,
        audioUrl: `/api/audio/voiceover_${projectId}.mp3`,
        durationMs: VOICE_DURATIONS[voiceStyle] ?? 45000,
      })
      .returning();
  }

  await db
    .update(projectsTable)
    .set({ status: "finding_clips", progress: 35 })
    .where(eq(projectsTable.id, projectId));

  res.json(row);
});

router.get("/:projectId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const [row] = await db
    .select()
    .from(voiceoverJobsTable)
    .where(eq(voiceoverJobsTable.projectId, projectId));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

export default router;
