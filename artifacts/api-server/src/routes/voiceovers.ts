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

// ElevenLabs voice IDs mapped to our voice styles
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  motivational_male: "pNInz6obpgDQGcFmaJgB",   // Adam — deep, powerful
  cinematic_female: "21m00Tcm4TlvDq8ikWAM",    // Rachel — calm, authoritative
  calm_authority: "ErXwobaYiN019PkySvjV",       // Antoni — smooth, confident
  intense_narrator: "VR6AewLTigWG4xSOukaG",     // Arnold — crispy, intense
};

async function synthesizeWithElevenLabs(text: string, voiceStyle: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  const voiceId = ELEVENLABS_VOICE_MAP[voiceStyle] ?? ELEVENLABS_VOICE_MAP["motivational_male"];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.slice(0, 5000),
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.82,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`ElevenLabs error ${response.status}: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

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

  try {
    const buffer = await synthesizeWithElevenLabs(text, voiceStyle);

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
    console.error("ElevenLabs TTS error:", err);
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
