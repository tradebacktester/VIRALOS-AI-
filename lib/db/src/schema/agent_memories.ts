import { pgTable, text, serial, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentMemoriesTable = pgTable("agent_memories", {
  id: serial("id").primaryKey(),
  agentType: text("agent_type").notNull(),
  memoryKey: text("memory_key").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  score: real("score").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAgentMemorySchema = createInsertSchema(agentMemoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;
export type AgentMemory = typeof agentMemoriesTable.$inferSelect;
