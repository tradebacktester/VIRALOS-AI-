import { Router } from "express";
import { db, scriptsTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GenerateScriptBody } from "@workspace/api-zod";

const router = Router();

const PLATFORM_STYLES: Record<string, string> = {
  youtube_shorts: "High energy, punchy hook, fast pacing, call-to-action at end",
  tiktok: "Trend-driven, relatable, quick cuts, trending audio compatible",
  reels: "Visually aesthetic, emotional arc, shareable moment",
  x_clips: "Debate-triggering, bold claim, short and punchy",
  all: "Universal viral format with broad appeal",
};

const EMOTION_CURVES: Record<string, string[]> = {
  motivational: ["intrigue", "tension", "struggle", "breakthrough", "triumph"],
  educational: ["curiosity", "confusion", "revelation", "clarity", "inspiration"],
  dramatic: ["shock", "disbelief", "tension", "climax", "resolution"],
};

router.post("/generate", async (req, res) => {
  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { projectId, prompt, platform, style } = parsed.data;

  const platformStyle = PLATFORM_STYLES[platform] ?? PLATFORM_STYLES["all"];
  const emotionCurve = EMOTION_CURVES[style ?? "motivational"] ?? EMOTION_CURVES["motivational"];

  const hook = `What if ${prompt} could change everything you thought you knew?`;
  const script = `[HOOK] ${hook}\n\n[PROBLEM] Most people don't realize that ${prompt} is one of the most misunderstood concepts in the world.\n\n[AGITATION] Every day you ignore this, you're leaving results on the table.\n\n[SOLUTION] Here's the 3-step framework that top performers use.\n\n[CTA] Follow for more frameworks like this.`;
  const cta = "Follow for more. Drop a comment if this hit different.";
  const scenes = [
    { index: 0, description: `Opening shot — powerful visual of ${prompt}`, emotion: "intrigue", duration: 3 },
    { index: 1, description: "B-roll: person struggling with the problem", emotion: "tension", duration: 4 },
    { index: 2, description: "Text overlay with key insight", emotion: "revelation", duration: 3 },
    { index: 3, description: "Transformation / solution visual", emotion: "triumph", duration: 4 },
    { index: 4, description: "CTA screen with call to action", emotion: "excitement", duration: 2 },
  ];

  const [existing] = await db
    .select()
    .from(scriptsTable)
    .where(eq(scriptsTable.projectId, projectId));

  let row;
  if (existing) {
    [row] = await db
      .update(scriptsTable)
      .set({ hook, script, emotionCurve, cta, platformStyle, scenes })
      .where(eq(scriptsTable.projectId, projectId))
      .returning();
  } else {
    [row] = await db
      .insert(scriptsTable)
      .values({ projectId, hook, script, emotionCurve, cta, platformStyle, scenes })
      .returning();
  }

  await db
    .update(projectsTable)
    .set({ status: "voicing", progress: 20 })
    .where(eq(projectsTable.id, projectId));

  res.json(row);
});

router.get("/:projectId", async (req, res) => {
  const projectId = Number(req.params.projectId);
  const [row] = await db
    .select()
    .from(scriptsTable)
    .where(eq(scriptsTable.projectId, projectId));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

export default router;
