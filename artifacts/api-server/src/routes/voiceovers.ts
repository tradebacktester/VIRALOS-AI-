import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, voiceoverJobsTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GenerateVoiceoverBody } from "@workspace/api-zod";

const router = Router();

const VOICE_MAP: Record<string, string> = {
  motivational_male: "onyx",
  cinematic_female: "nova",
  calm_authority: "alloy",
  intense_narrator: "echo",
};

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

router.post("/synthesize", async (req, res) => {
  const { text, voiceStyle = "motivational_male", projectId } = req.body as {
    text?: string;
    voiceStyle?: string;
    projectId?: number;
  };

  if (!text || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const voice = (VOICE_MAP[voiceStyle] ?? "onyx") as "onyx" | "nova" | "alloy" | "echo" | "fable" | "shimmer";

  try {
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice,
      input: text.slice(0, 4096),
      speed: 0.92,
    });

    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    if (projectId) {
      try {
        const [existing] = await db
          .select()
          .from(voiceoverJobsTable)
          .where(eq(voiceoverJobsTable.projectId, Number(projectId)));

        const payload = {
          status: "done" as const,
          voiceStyle,
          audioUrl: `/api/audio/voiceover_${projectId}.mp3`,
          durationMs: Math.round((buffer.length / 16000) * 1000),
        };

        if (existing) {
          await db.update(voiceoverJobsTable).set(payload).where(eq(voiceoverJobsTable.projectId, Number(projectId)));
        } else {
          await db.insert(voiceoverJobsTable).values({ projectId: Number(projectId), ...payload });
        }
      } catch {}
    }

    res.set("Content-Type", "audio/mpeg");
    res.set("Content-Length", String(buffer.length));
    res.set("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    console.error("TTS synthesis error:", err);
    res.status(500).json({ error: "Voice synthesis failed", details: String(err) });
  }
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
