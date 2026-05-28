import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scheduledPostsTable = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  platform: text("platform").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled | posted | failed | cancelled
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  title: text("title"),
  description: text("description"),
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  platformPostId: text("platform_post_id"),
  isAbTest: boolean("is_ab_test").default(false),
  abTestGroupId: text("ab_test_group_id"),
  error: text("error"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScheduledPostSchema = createInsertSchema(scheduledPostsTable).omit({ id: true, createdAt: true });
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;
export type ScheduledPost = typeof scheduledPostsTable.$inferSelect;
