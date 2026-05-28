import { pgTable, text, serial, timestamp, real, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const styleProfilesTable = pgTable("style_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  creatorHandle: text("creator_handle"),
  isMarketplaceListing: boolean("is_marketplace_listing").default(false),
  price: real("price").default(0),
  category: text("category"), // motivation | comedy | education | gaming | finance | lifestyle
  // Genome components
  hookDNA: jsonb("hook_dna").$type<{
    openingStyle: string; // question|statement|shock|curiosity
    avgLengthMs: number;
    paceWords: number; // words per second
    emotionTrigger: string;
    exampleHooks: string[];
  }>(),
  pacingDNA: jsonb("pacing_dna").$type<{
    avgCutRateMs: number;
    rhythmStyle: string; // staccato|flowing|mixed
    pauseFrequency: string;
    energyLevel: number; // 1-10
    transitionStyle: string;
  }>(),
  emotionalDNA: jsonb("emotional_dna").$type<{
    primaryEmotion: string;
    emotionalArc: string;
    intensityProgression: string;
    triggerPsychology: string[];
    audienceDesire: string;
  }>(),
  visualDNA: jsonb("visual_dna").$type<{
    colorPalette: string[];
    brightness: string;
    contrastLevel: string;
    motionStyle: string;
    cameraWork: string;
    overlayStyle: string;
  }>(),
  typographyDNA: jsonb("typography_dna").$type<{
    captionStyle: string;
    fontWeight: string;
    fontSize: string;
    animationStyle: string;
    colorScheme: string;
    position: string;
    outlineStyle: string;
  }>(),
  storytellingDNA: jsonb("storytelling_dna").$type<{
    narrativeStructure: string;
    conflictStyle: string;
    resolutionPattern: string;
    characterVoice: string;
    vocabularyLevel: string;
    humorStyle: string;
  }>(),
  // Analytics
  viralScore: real("viral_score").default(0),
  avgRetention: real("avg_retention").default(0),
  timesApplied: integer("times_applied").default(0),
  rating: real("rating").default(0),
  downloads: integer("downloads").default(0),
  tags: jsonb("tags").$type<string[]>().default([]),
  thumbnailConcept: text("thumbnail_concept"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStyleProfileSchema = createInsertSchema(styleProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStyleProfile = z.infer<typeof insertStyleProfileSchema>;
export type StyleProfile = typeof styleProfilesTable.$inferSelect;
