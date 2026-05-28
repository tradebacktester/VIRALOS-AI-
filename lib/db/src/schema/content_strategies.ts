import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contentStrategiesTable = pgTable("content_strategies", {
  id: serial("id").primaryKey(),
  niche: text("niche").notNull(),
  pillars: jsonb("pillars").notNull(),
  postingSchedule: jsonb("posting_schedule").notNull(),
  hookStrategies: jsonb("hook_strategies").notNull(),
  emotionalPositioning: text("emotional_positioning").notNull(),
  nicheAnalysis: text("niche_analysis").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContentStrategySchema = createInsertSchema(contentStrategiesTable).omit({ id: true, createdAt: true });
export type InsertContentStrategy = z.infer<typeof insertContentStrategySchema>;
export type ContentStrategy = typeof contentStrategiesTable.$inferSelect;
