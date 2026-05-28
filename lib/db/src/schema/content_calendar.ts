import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contentCalendarTable = pgTable("content_calendar", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  platform: text("platform").notNull(),
  contentType: text("content_type").notNull(), // hook_test | trend_surf | series_episode | educational | viral_attempt
  pillar: text("pillar"), // content pillar name
  theme: text("theme"),
  hookIdea: text("hook_idea"),
  emotionalAngle: text("emotional_angle"),
  trendWindow: text("trend_window"), // morning | afternoon | evening | night
  optimalUploadTime: text("optimal_upload_time"), // HH:MM
  projectId: integer("project_id"),
  scheduledPostId: integer("scheduled_post_id"),
  isGenerated: boolean("is_generated").default(false),
  isPosted: boolean("is_posted").default(false),
  seriesId: integer("series_id"),
  episodeNumber: integer("episode_number"),
  notes: text("notes"),
  aiRationale: text("ai_rationale"),
  predictedViralScore: integer("predicted_viral_score").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContentCalendarSchema = createInsertSchema(contentCalendarTable).omit({ id: true, createdAt: true });
export type InsertContentCalendar = z.infer<typeof insertContentCalendarSchema>;
export type ContentCalendar = typeof contentCalendarTable.$inferSelect;
