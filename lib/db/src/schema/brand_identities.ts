import { pgTable, text, serial, timestamp, boolean, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const brandIdentitiesTable = pgTable("brand_identities", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  brandName: text("brand_name").notNull(),
  tagline: text("tagline"),
  niche: text("niche").notNull(),
  missionStatement: text("mission_statement"),
  brandPersonality: jsonb("brand_personality").$type<string[]>().default([]),
  targetAudience: jsonb("target_audience").$type<{
    age: string; gender: string; psychographic: string; painPoint: string; desire: string;
  }>(),
  visualIdentity: jsonb("visual_identity").$type<{
    primaryColor: string; secondaryColor: string; accentColor: string;
    logoConceptDescription: string; fontStyle: string; moodboardKeywords: string[];
    aestheticStyle: string;
  }>(),
  contentPillars: jsonb("content_pillars").$type<Array<{
    name: string; percentage: number; description: string; exampleHooks: string[];
  }>>().default([]),
  channelStrategy: jsonb("channel_strategy").$type<{
    primaryPlatform: string; secondaryPlatforms: string[];
    postingFrequency: string; peakUploadTimes: string[];
    growthStrategy: string; firstMonthGoal: string;
  }>(),
  thumbnailStyle: text("thumbnail_style"),
  channelName: text("channel_name"),
  channelDescription: text("channel_description"),
  introHook: text("intro_hook"),
  brandVoice: text("brand_voice"),
  competitorGaps: jsonb("competitor_gaps").$type<string[]>().default([]),
  monetizationPath: text("monetization_path"),
  isDeployed: boolean("is_deployed").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const channelsTable = pgTable("channels", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id"),
  name: text("name").notNull(),
  niche: text("niche").notNull(),
  platform: text("platform").notNull(),
  handle: text("handle"),
  status: text("status").notNull().default("active"), // active|paused|scaling
  followersCount: text("followers_count").default("0"),
  avgViews: text("avg_views").default("0"),
  monthlyRevenue: text("monthly_revenue").default("$0"),
  contentPillar: text("content_pillar"),
  psychTarget: text("psych_target"), // ambition|loneliness|fear|ego|revenge|discipline
  styleProfileId: integer("style_profile_id"),
  scheduledPostsCount: integer("scheduled_posts_count").default(0),
  lastPostedAt: timestamp("last_posted_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storyUniversesTable = pgTable("story_universes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  niche: text("niche").notNull(),
  logline: text("logline"),
  worldDescription: text("world_description"),
  characters: jsonb("characters").$type<Array<{
    name: string; archetype: string; backstory: string; voiceTone: string; role: string;
  }>>().default([]),
  narrativeArcs: jsonb("narrative_arcs").$type<Array<{
    arcName: string; episodes: number; tensionBuild: string; climax: string; payoff: string;
  }>>().default([]),
  recurringThemes: jsonb("recurring_themes").$type<string[]>().default([]),
  visualLore: text("visual_lore"),
  audienceAttachmentStrategy: text("audience_attachment_strategy"),
  episodesProduced: integer("episodes_produced").default(0),
  bingeLoopDesign: text("binge_loop_design"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const renderQueueTable = pgTable("render_queue", {
  id: serial("id").primaryKey(),
  taskType: text("task_type").notNull(), // script|voiceover|clip|caption|render|export
  projectId: integer("project_id"),
  priority: integer("priority").default(5), // 1-10
  status: text("status").notNull().default("queued"), // queued|processing|done|failed
  gpuAssigned: text("gpu_assigned"),
  estimatedMs: integer("estimated_ms"),
  actualMs: integer("actual_ms"),
  costCredits: real("cost_credits").default(0),
  cachedResult: boolean("cached_result").default(false),
  cacheKey: text("cache_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertBrandIdentitySchema = createInsertSchema(brandIdentitiesTable).omit({ id: true, createdAt: true });
export type InsertBrandIdentity = z.infer<typeof insertBrandIdentitySchema>;
export type BrandIdentity = typeof brandIdentitiesTable.$inferSelect;

export const insertChannelSchema = createInsertSchema(channelsTable).omit({ id: true, createdAt: true });
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channelsTable.$inferSelect;

export const insertStoryUniverseSchema = createInsertSchema(storyUniversesTable).omit({ id: true, createdAt: true });
export type InsertStoryUniverse = z.infer<typeof insertStoryUniverseSchema>;
export type StoryUniverse = typeof storyUniversesTable.$inferSelect;

export const insertRenderQueueSchema = createInsertSchema(renderQueueTable).omit({ id: true, createdAt: true });
export type InsertRenderQueue = z.infer<typeof insertRenderQueueSchema>;
export type RenderQueue = typeof renderQueueTable.$inferSelect;
