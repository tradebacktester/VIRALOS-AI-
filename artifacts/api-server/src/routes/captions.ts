import { Router } from "express";
import { db, captionsTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GenerateCaptionsBody } from "@workspace/api-zod";

const router = Router();

function generateCaptionWords(script: string): Array<{ word: string; startMs: number; endMs: number; highlighted: boolean; emoji: string | null }> {
  const words = script
    .replace(/\[.*?\]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 60);

  const HIGHLIGHT_WORDS = new Set(["everything", "change", "most", "power", "secret", "never", "always", "results", "top", "framework"]);
  const EMOJI_MAP: Record<string, string> = {
    "fire": "🔥",
    "money": "💰",
    "mind": "🧠",
    "power": "⚡",
    "win": "🏆",
  };

  return words.map((word, i) => {
    const startMs = i * 400;
    const endMs = startMs + 380;
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    return {
      word,
      startMs,
      endMs,
      highlighted: HIGHLIGHT_WORDS.has(clean),
      emoji: EMOJI_MAP[clean] ?? null,
    };
  });
}

router.post("/generate", async (req, res) => {
  const parsed = GenerateCaptionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { projectId, script, style = "dopamine" } = parsed.data;
  const words = generateCaptionWords(script);

  const [existing] = await db
    .select()
    .from(captionsTable)
    .where(eq(captionsTable.projectId, projectId));

  let row;
  if (existing) {
    [row] = await db
      .update(captionsTable)
      .set({ style, words })
      .where(eq(captionsTable.projectId, projectId))
      .returning();
  } else {
    [row] = await db
      .insert(captionsTable)
      .values({ projectId, style, words })
      .returning();
  }

  res.json(row);
});

router.get("/:projectId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const [row] = await db
    .select()
    .from(captionsTable)
    .where(eq(captionsTable.projectId, projectId));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

export default router;
