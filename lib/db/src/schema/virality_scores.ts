import { pgTable, text, serial, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const viralityScoresTable = pgTable("virality_scores", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  viralProbability: real("viral_probability").notNull().default(0),
  hookScore: real("hook_score").notNull().default(0),
  emotionScore: real("emotion_score").notNull().default(0),
  curiosityGap: real("curiosity_gap").notNull().default(0),
  replayPotential: real("replay_potential").notNull().default(0),
  retentionPrediction: text("retention_prediction").notNull().default("medium"),
  shareability: real("shareability").notNull().default(0),
  breakdown: jsonb("breakdown"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertViralityScoreSchema = createInsertSchema(viralityScoresTable).omit({ id: true, createdAt: true });
export type InsertViralityScore = z.infer<typeof insertViralityScoreSchema>;
export type ViralityScore = typeof viralityScoresTable.$inferSelect;
