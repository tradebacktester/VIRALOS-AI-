import { Router } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListProjectsQueryParams,
  CreateProjectBody,
  UpdateProjectBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const params = ListProjectsQueryParams.safeParse(req.query);
  let query = db.select().from(projectsTable);
  const rows = await query.orderBy(desc(projectsTable.createdAt));
  let results = rows;
  if (params.success && params.data.status) {
    results = rows.filter((r) => r.status === params.data.status);
  }
  if (params.success && params.data.platform) {
    results = results.filter((r) => r.platform === params.data.platform);
  }
  res.json(results);
});

router.post("/", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [row] = await db
    .insert(projectsTable)
    .values({
      title: parsed.data.title,
      prompt: parsed.data.prompt,
      platform: parsed.data.platform,
      status: "pending",
      progress: 0,
    })
    .returning();
  res.status(201).json(row);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.progress !== undefined) updates.progress = parsed.data.progress;
  const [row] = await db
    .update(projectsTable)
    .set(updates)
    .where(eq(projectsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.status(204).send();
});

export default router;
