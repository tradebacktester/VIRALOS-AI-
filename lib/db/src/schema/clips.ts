import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clipsTable = pgTable("clips", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  source: text("source").notNull().default("pexels"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  duration: integer("duration").notNull().default(0),
  query: text("query").notNull(),
  emotionTag: text("emotion_tag"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clipJobsTable = pgTable("clip_jobs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull().default("queued"),
  provider: text("provider").notNull().default("runway"),
  resultUrl: text("result_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClipSchema = createInsertSchema(clipsTable).omit({ id: true, createdAt: true });
export type InsertClip = z.infer<typeof insertClipSchema>;
export type Clip = typeof clipsTable.$inferSelect;
