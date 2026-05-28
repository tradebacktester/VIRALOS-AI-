import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scriptsTable = pgTable("scripts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  hook: text("hook").notNull(),
  script: text("script").notNull(),
  emotionCurve: jsonb("emotion_curve").$type<string[]>().default([]),
  cta: text("cta").notNull(),
  platformStyle: text("platform_style").notNull(),
  scenes: jsonb("scenes").$type<Array<{ index: number; description: string; emotion?: string; duration: number }>>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScriptSchema = createInsertSchema(scriptsTable).omit({ id: true, createdAt: true });
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scriptsTable.$inferSelect;
