import { Router } from "express";
import { db } from "@workspace/db";
import { styleProfilesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { runPersonalityAgent, applyStyleToContent } from "../agents/personality-agent.js";

const router = Router();

const MARKETPLACE_SEEDS = [
  {
    name: "Dark Anime Pack",
    creatorHandle: "darkanime_style",
    category: "motivation",
    description: "Cinematic dark anime aesthetic with high-contrast visuals, intense music drops, and philosophical hooks",
    viralScore: 94, avgRetention: 78, rating: 4.9, downloads: 2847, price: 29,
    isMarketplaceListing: true,
    tags: ["anime", "dark", "motivation", "cinematic"],
    hookDNA: { openingStyle: "shock", avgLengthMs: 500, paceWords: 5.2, emotionTrigger: "existential tension", exampleHooks: ["You were never meant to be average.", "The system doesn't want you to know this.", "Every champion was told they were dreaming too big."] },
    pacingDNA: { avgCutRateMs: 600, rhythmStyle: "staccato", pauseFrequency: "dramatic", energyLevel: 9, transitionStyle: "zoom punch" },
    emotionalDNA: { primaryEmotion: "ambition", emotionalArc: "quiet despair → explosive determination", intensityProgression: "crescendo", triggerPsychology: ["identity threat", "epic destiny narrative"], audienceDesire: "to feel chosen and powerful" },
    visualDNA: { colorPalette: ["#0a0a0a", "#c41e3a", "#ffffff"], brightness: "dark", contrastLevel: "high", motionStyle: "fast-kinetic", cameraWork: "tracking", overlayStyle: "graphic-rich" },
    typographyDNA: { captionStyle: "bold-minimal", fontWeight: "black", fontSize: "large", animationStyle: "pop", colorScheme: "white-black-outline", position: "center", outlineStyle: "thick-stroke" },
    storytellingDNA: { narrativeStructure: "hero-journey", conflictStyle: "internal", resolutionPattern: "triumph", characterVoice: "authoritative", vocabularyLevel: "street", humorStyle: "none" },
  },
  {
    name: "Hormozi Captions",
    creatorHandle: "hormozi_style",
    category: "education",
    description: "Alex Hormozi-inspired direct response captions. Bold, no fluff, maximum value density.",
    viralScore: 91, avgRetention: 82, rating: 4.8, downloads: 5102, price: 19,
    isMarketplaceListing: true,
    tags: ["business", "education", "direct", "captions"],
    hookDNA: { openingStyle: "statement", avgLengthMs: 800, paceWords: 3.8, emotionTrigger: "intellectual challenge", exampleHooks: ["Most people waste 10 years learning this the hard way.", "Here's why your business isn't growing.", "The brutal truth about making money."] },
    pacingDNA: { avgCutRateMs: 1200, rhythmStyle: "flowing", pauseFrequency: "frequent", energyLevel: 7, transitionStyle: "hard cut" },
    emotionalDNA: { primaryEmotion: "discipline", emotionalArc: "problem recognition → insight → action", intensityProgression: "flat", triggerPsychology: ["competence desire", "status threat"], audienceDesire: "to be taken seriously and succeed" },
    visualDNA: { colorPalette: ["#ffffff", "#000000", "#1a1a1a"], brightness: "neutral", contrastLevel: "high", motionStyle: "punchy", cameraWork: "static", overlayStyle: "text-heavy" },
    typographyDNA: { captionStyle: "full-screen", fontWeight: "bold", fontSize: "large", animationStyle: "pop", colorScheme: "yellow", position: "center", outlineStyle: "drop-shadow" },
    storytellingDNA: { narrativeStructure: "problem-solution", conflictStyle: "external", resolutionPattern: "insight", characterVoice: "mentor", vocabularyLevel: "professional", humorStyle: "deadpan" },
  },
  {
    name: "Cinematic MMA Style",
    creatorHandle: "mma_cinematic",
    category: "sports",
    description: "Cinematic MMA/combat sports aesthetic. Slow motion, dramatic music, warrior psychology.",
    viralScore: 89, avgRetention: 74, rating: 4.7, downloads: 1893, price: 24,
    isMarketplaceListing: true,
    tags: ["mma", "sports", "cinematic", "warrior"],
    hookDNA: { openingStyle: "shock", avgLengthMs: 400, paceWords: 4.8, emotionTrigger: "primal aggression", exampleHooks: ["He was told he'd never fight again.", "This is what real discipline looks like.", "Nobody trains like this anymore."] },
    pacingDNA: { avgCutRateMs: 400, rhythmStyle: "staccato", pauseFrequency: "dramatic", energyLevel: 10, transitionStyle: "whip pan" },
    emotionalDNA: { primaryEmotion: "ego", emotionalArc: "underdog → trial → warrior", intensityProgression: "spike", triggerPsychology: ["masculinity affirmation", "competitive drive"], audienceDesire: "to feel powerful and respected" },
    visualDNA: { colorPalette: ["#1a0a00", "#ff4500", "#c0c0c0"], brightness: "dark", contrastLevel: "high", motionStyle: "fast-kinetic", cameraWork: "handheld", overlayStyle: "graphic-rich" },
    typographyDNA: { captionStyle: "animated-word", fontWeight: "black", fontSize: "large", animationStyle: "pop", colorScheme: "white-black-outline", position: "bottom-third", outlineStyle: "thick-stroke" },
    storytellingDNA: { narrativeStructure: "hero-journey", conflictStyle: "external", resolutionPattern: "triumph", characterVoice: "rebellious", vocabularyLevel: "street", humorStyle: "none" },
  },
  {
    name: "Luxury Motivation Theme",
    creatorHandle: "luxury_mindset",
    category: "lifestyle",
    description: "Premium lifestyle motivation. Gold tones, aspirational imagery, wealth psychology.",
    viralScore: 87, avgRetention: 69, rating: 4.6, downloads: 3241, price: 34,
    isMarketplaceListing: true,
    tags: ["luxury", "motivation", "lifestyle", "wealth"],
    hookDNA: { openingStyle: "curiosity", avgLengthMs: 700, paceWords: 3.5, emotionTrigger: "aspiration and longing", exampleHooks: ["This is what your life could look like.", "The 1% doesn't think like you do.", "Most people will never understand this feeling."] },
    pacingDNA: { avgCutRateMs: 1000, rhythmStyle: "flowing", pauseFrequency: "rare", energyLevel: 6, transitionStyle: "dissolve" },
    emotionalDNA: { primaryEmotion: "loneliness", emotionalArc: "isolation → aspiration → elevation", intensityProgression: "wave", triggerPsychology: ["status aspiration", "belonging to elite"], audienceDesire: "to escape mediocrity and feel chosen" },
    visualDNA: { colorPalette: ["#0d0d0d", "#c9a84c", "#f5f5f5"], brightness: "dark", contrastLevel: "medium", motionStyle: "slow-cinematic", cameraWork: "tracking", overlayStyle: "minimal" },
    typographyDNA: { captionStyle: "cinematic-lower-third", fontWeight: "medium", fontSize: "medium", animationStyle: "fade", colorScheme: "minimal-white", position: "bottom-third", outlineStyle: "thin-outline" },
    storytellingDNA: { narrativeStructure: "contrast", conflictStyle: "internal", resolutionPattern: "open-loop", characterVoice: "mentor", vocabularyLevel: "professional", humorStyle: "none" },
  },
  {
    name: "Sigma Finance Pack",
    creatorHandle: "sigma_finance",
    category: "finance",
    description: "Cold, calculated finance content. Data-driven hooks, chart overlays, wealth mindset.",
    viralScore: 85, avgRetention: 76, rating: 4.5, downloads: 2156, price: 22,
    isMarketplaceListing: true,
    tags: ["finance", "sigma", "money", "investing"],
    hookDNA: { openingStyle: "controversial", avgLengthMs: 600, paceWords: 4.0, emotionTrigger: "fear of missing out", exampleHooks: ["Your bank is legally stealing from you.", "This one asset beats everything in your portfolio.", "Most investors will go broke doing this."] },
    pacingDNA: { avgCutRateMs: 900, rhythmStyle: "mixed", pauseFrequency: "frequent", energyLevel: 7, transitionStyle: "hard cut" },
    emotionalDNA: { primaryEmotion: "fear", emotionalArc: "threat exposure → insight → power", intensityProgression: "crescendo", triggerPsychology: ["loss aversion", "scarcity mindset"], audienceDesire: "financial security and superiority" },
    visualDNA: { colorPalette: ["#000814", "#00b4d8", "#caf0f8"], brightness: "dark", contrastLevel: "high", motionStyle: "punchy", cameraWork: "static", overlayStyle: "text-heavy" },
    typographyDNA: { captionStyle: "full-screen", fontWeight: "bold", fontSize: "medium", animationStyle: "typewriter", colorScheme: "color-coded-emotion", position: "center", outlineStyle: "none" },
    storytellingDNA: { narrativeStructure: "reveal", conflictStyle: "systemic", resolutionPattern: "insight", characterVoice: "authoritative", vocabularyLevel: "professional", humorStyle: "deadpan" },
  },
];

let seeded = false;

async function seedMarketplace() {
  if (seeded) return;
  try {
    const existing = await db.select().from(styleProfilesTable).limit(1);
    if (existing.length === 0) {
      for (const item of MARKETPLACE_SEEDS) {
        await db.insert(styleProfilesTable).values(item as any);
      }
    }
    seeded = true;
  } catch { seeded = true; }
}

router.get("/profiles", async (_req, res) => {
  await seedMarketplace();
  const profiles = await db.select().from(styleProfilesTable).orderBy(desc(styleProfilesTable.downloads));
  res.json(profiles);
});

router.get("/marketplace", async (_req, res) => {
  await seedMarketplace();
  const items = await db.select().from(styleProfilesTable).orderBy(desc(styleProfilesTable.downloads));
  res.json(items.filter((i) => i.isMarketplaceListing));
});

router.post("/clone", async (req, res) => {
  const { creatorHandle, styleDescription, sampleScripts, category } = req.body as {
    creatorHandle: string; styleDescription: string; sampleScripts?: string[]; category?: string;
  };
  if (!creatorHandle || !styleDescription) {
    res.status(400).json({ error: "creatorHandle and styleDescription required" });
    return;
  }
  const result = await runPersonalityAgent(creatorHandle, styleDescription, sampleScripts ?? [], category ?? "motivation");
  res.json(result);
});

router.post("/apply/:id", async (req, res) => {
  const { rawScript, topic } = req.body as { rawScript: string; topic: string };
  const result = await applyStyleToContent(Number(req.params.id), rawScript ?? "", topic ?? "");
  res.json(result);
});

router.post("/marketplace/:id/install", async (req, res) => {
  const [item] = await db.select().from(styleProfilesTable)
    .where(eq(styleProfilesTable.id, Number(req.params.id))).limit(1);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(styleProfilesTable)
    .set({ downloads: (item.downloads ?? 0) + 1 })
    .where(eq(styleProfilesTable.id, item.id));
  res.json({ success: true, profile: item });
});

router.delete("/profiles/:id", async (req, res) => {
  await db.delete(styleProfilesTable).where(eq(styleProfilesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
