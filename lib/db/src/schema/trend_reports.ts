import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trendReportsTable = pgTable("trend_reports", {
  id: serial("id").primaryKey(),
  reportDate: text("report_date").notNull(),
  risingTrends: jsonb("rising_trends").notNull(),
  viralSounds: jsonb("viral_sounds").notNull(),
  emotionalPatterns: jsonb("emotional_patterns").notNull(),
  highRetentionFormats: jsonb("high_retention_formats").notNull(),
  trendingAesthetics: jsonb("trending_aesthetics").notNull(),
  platformBreakdown: jsonb("platform_breakdown").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTrendReportSchema = createInsertSchema(trendReportsTable).omit({ id: true, createdAt: true });
export type InsertTrendReport = z.infer<typeof insertTrendReportSchema>;
export type TrendReport = typeof trendReportsTable.$inferSelect;
