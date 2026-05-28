import { pgTable, text, serial, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const performanceAnalyticsTable = pgTable("performance_analytics", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  scheduledPostId: integer("scheduled_post_id"),
  platform: text("platform").notNull(),
  collectedAt: timestamp("collected_at", { withTimezone: true }).notNull().defaultNow(),
  // Core metrics
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  // Retention
  watchTimeSeconds: real("watch_time_seconds").default(0),
  avgWatchPct: real("avg_watch_pct").default(0),
  completionRate: real("completion_rate").default(0),
  replayRate: real("replay_rate").default(0),
  swipeAwayRate: real("swipe_away_rate").default(0),
  retentionCurve: jsonb("retention_curve").$type<number[]>().default([]),
  // Engagement
  engagementRate: real("engagement_rate").default(0),
  clickThroughRate: real("click_through_rate").default(0),
  // Demographics
  audienceDemographics: jsonb("audience_demographics"),
  topCountries: jsonb("top_countries").$type<string[]>().default([]),
  ageBreakdown: jsonb("age_breakdown"),
  // Raw snapshot
  rawData: jsonb("raw_data"),
});

export const insertPerformanceAnalyticsSchema = createInsertSchema(performanceAnalyticsTable).omit({ id: true, collectedAt: true });
export type InsertPerformanceAnalytics = z.infer<typeof insertPerformanceAnalyticsSchema>;
export type PerformanceAnalytics = typeof performanceAnalyticsTable.$inferSelect;
