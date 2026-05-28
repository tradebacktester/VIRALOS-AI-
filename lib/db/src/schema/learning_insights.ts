import { pgTable, text, serial, timestamp, real, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const learningInsightsTable = pgTable("learning_insights", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // retention | hook | caption | pacing | visual | audio | emotion | posting_time
  insight: text("insight").notNull(), // human-readable finding
  pattern: text("pattern"), // machine-readable pattern key
  impactMetric: text("impact_metric"), // what metric this improves
  impactValue: real("impact_value").default(0), // % improvement
  confidence: real("confidence").default(0), // 0-1
  sampleSize: integer("sample_size").default(0),
  isActive: boolean("is_active").default(true),
  appliedCount: integer("applied_count").default(0),
  avgImprovementPct: real("avg_improvement_pct").default(0),
  evidence: jsonb("evidence").$type<Array<{ projectId: number; metric: string; before: number; after: number }>>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentSeriesTable = pgTable("content_series", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  niche: text("niche").notNull(),
  platform: text("platform").notNull(),
  emotionalArc: text("emotional_arc").notNull(), // rising_tension | cyclical | progressive_revelation
  visualIdentity: jsonb("visual_identity").$type<{
    colorPalette: string[];
    fontStyle: string;
    cameraStyle: string;
    editingRhythm: string;
  }>(),
  recurringThemes: jsonb("recurring_themes").$type<string[]>().default([]),
  targetEpisodes: integer("target_episodes").default(10),
  episodesCreated: integer("episodes_created").default(0),
  avgRetention: real("avg_retention").default(0),
  bingeScore: real("binge_score").default(0),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commentInsightsTable = pgTable("comment_insights", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  platform: text("platform").notNull(),
  totalComments: integer("total_comments").default(0),
  dominantEmotion: text("dominant_emotion"),
  topRequests: jsonb("top_requests").$type<string[]>().default([]),
  painPoints: jsonb("pain_points").$type<string[]>().default([]),
  audienceDesires: jsonb("audience_desires").$type<string[]>().default([]),
  sentimentScore: real("sentiment_score").default(0), // -1 to 1
  viralComments: jsonb("viral_comments").$type<Array<{ text: string; likes: number; emotion: string }>>().default([]),
  feedIntoNextVideo: boolean("feed_into_next_video").default(true),
  actionableTakeaways: jsonb("actionable_takeaways").$type<string[]>().default([]),
  rawAnalysis: text("raw_analysis"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLearningInsightSchema = createInsertSchema(learningInsightsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLearningInsight = z.infer<typeof insertLearningInsightSchema>;
export type LearningInsight = typeof learningInsightsTable.$inferSelect;

export const insertContentSeriesSchema = createInsertSchema(contentSeriesTable).omit({ id: true, createdAt: true });
export type InsertContentSeries = z.infer<typeof insertContentSeriesSchema>;
export type ContentSeries = typeof contentSeriesTable.$inferSelect;

export const insertCommentInsightSchema = createInsertSchema(commentInsightsTable).omit({ id: true, createdAt: true });
export type InsertCommentInsight = z.infer<typeof insertCommentInsightSchema>;
export type CommentInsight = typeof commentInsightsTable.$inferSelect;
