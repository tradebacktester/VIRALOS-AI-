import { pgTable, text, serial, timestamp, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const abTestsTable = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  name: text("name").notNull(),
  testType: text("test_type").notNull(), // hook | caption | thumbnail | cta | upload_time
  status: text("status").notNull().default("running"), // running | completed | paused
  platform: text("platform"),
  variants: jsonb("variants").$type<Array<{
    id: string;
    label: string;
    content: string;
    impressions: number;
    views: number;
    retention: number;
    engagement: number;
    score: number;
  }>>().default([]),
  winnerId: text("winner_id"),
  winnerReason: text("winner_reason"),
  confidenceLevel: real("confidence_level").default(0),
  totalImpressions: integer("total_impressions").default(0),
  autoApply: boolean("auto_apply").default(true),
  insights: jsonb("insights").$type<string[]>().default([]),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAbTestSchema = createInsertSchema(abTestsTable).omit({ id: true, createdAt: true });
export type InsertAbTest = z.infer<typeof insertAbTestSchema>;
export type AbTest = typeof abTestsTable.$inferSelect;
