import { Router } from "express";
import { db, trendsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ListTrendsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const params = ListTrendsQueryParams.safeParse(req.query);
  let rows = await db.select().from(trendsTable).orderBy(desc(trendsTable.score));

  if (params.success) {
    if (params.data.platform) {
      rows = rows.filter((r) => r.platform === params.data.platform);
    }
    if (params.data.category) {
      rows = rows.filter((r) => r.category === params.data.category);
    }
  }

  res.json(rows);
});

export default router;
