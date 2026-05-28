import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const voiceoverJobsTable = pgTable("voiceover_jobs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull().default("queued"),
  voiceStyle: text("voice_style").notNull().default("motivational_male"),
  audioUrl: text("audio_url"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVoiceoverSchema = createInsertSchema(voiceoverJobsTable).omit({ id: true, createdAt: true });
export type InsertVoiceover = z.infer<typeof insertVoiceoverSchema>;
export type VoiceoverJob = typeof voiceoverJobsTable.$inferSelect;
