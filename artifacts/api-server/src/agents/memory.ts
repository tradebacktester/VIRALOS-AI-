import { db } from "@workspace/db";
import { agentMemoriesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import type { AgentMemoryEntry } from "./types.js";

export async function recallMemories(agentType: string, limit = 10): Promise<AgentMemoryEntry[]> {
  const rows = await db
    .select()
    .from(agentMemoriesTable)
    .where(eq(agentMemoriesTable.agentType, agentType))
    .orderBy(desc(agentMemoriesTable.score), desc(agentMemoriesTable.updatedAt))
    .limit(limit);

  return rows.map((r) => ({
    key: r.memoryKey,
    content: r.content,
    score: r.score ?? 0,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
  }));
}

export async function storeMemory(
  agentType: string,
  key: string,
  content: string,
  score = 0,
  metadata?: Record<string, unknown>
): Promise<void> {
  const existing = await db
    .select()
    .from(agentMemoriesTable)
    .where(and(eq(agentMemoriesTable.agentType, agentType), eq(agentMemoriesTable.memoryKey, key)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(agentMemoriesTable)
      .set({ content, score, metadata: metadata ?? null, updatedAt: new Date() })
      .where(and(eq(agentMemoriesTable.agentType, agentType), eq(agentMemoriesTable.memoryKey, key)));
  } else {
    await db.insert(agentMemoriesTable).values({ agentType, memoryKey: key, content, score, metadata: metadata ?? null });
  }
}

export async function reinforceMemory(agentType: string, key: string, scoreDelta: number): Promise<void> {
  const existing = await db
    .select()
    .from(agentMemoriesTable)
    .where(and(eq(agentMemoriesTable.agentType, agentType), eq(agentMemoriesTable.memoryKey, key)))
    .limit(1);

  if (existing.length > 0) {
    const newScore = (existing[0].score ?? 0) + scoreDelta;
    await db
      .update(agentMemoriesTable)
      .set({ score: newScore, updatedAt: new Date() })
      .where(and(eq(agentMemoriesTable.agentType, agentType), eq(agentMemoriesTable.memoryKey, key)));
  }
}
