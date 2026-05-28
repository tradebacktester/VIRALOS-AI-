import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const captionsTable = pgTable("captions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  style: text("style").notNull().default("dopamine"),
  words: jsonb("words").$type<Array<{ word: string; startMs: number; endMs: number; highlighted?: boolean; emoji?: string | null }>>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaptionSchema = createInsertSchema(captionsTable).omit({ id: true, createdAt: true });
export type InsertCaption = z.infer<typeof insertCaptionSchema>;
export type Caption = typeof captionsTable.$inferSelect;
