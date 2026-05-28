import { Router } from "express";
import { runMonetizationAgent } from "../agents/comment-agent.js";

const router = Router();

router.post("/analyze", async (req, res) => {
  const { niche, platform, audienceSize, avgViews } = req.body as {
    niche: string; platform?: string; audienceSize?: string; avgViews?: string;
  };
  if (!niche) { res.status(400).json({ error: "niche required" }); return; }

  const result = await runMonetizationAgent(
    niche,
    platform ?? "tiktok",
    audienceSize ?? "10K-50K",
    avgViews ?? "5K-20K"
  );
  res.json(result);
});

export default router;
