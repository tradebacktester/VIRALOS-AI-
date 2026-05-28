import { Router } from "express";
import { db, projectsTable, exportJobsTable, renderJobsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard", async (req, res) => {
  const projects = await db.select().from(projectsTable);
  const totalProjects = projects.length;
  const videosGenerated = projects.filter((p) => p.status === "done").length;
  const inProgress = projects.filter((p) =>
    ["scripting", "voicing", "finding_clips", "editing", "rendering"].includes(p.status)
  ).length;

  const exports = await db.select().from(exportJobsTable);
  const exportsReady = exports.filter((e) => e.status === "done").length;

  const doneProjects = projects.filter((p) => p.status === "done").length;
  const notFailedProjects = projects.filter((p) => p.status !== "failed").length;
  const successRate = notFailedProjects > 0 ? (doneProjects / notFailedProjects) * 100 : 0;

  const totalDurationSec = videosGenerated * 45;

  res.json({
    totalProjects,
    videosGenerated,
    exportsReady,
    inProgress,
    successRate: Math.round(successRate * 10) / 10,
    totalDurationSec,
  });
});

router.get("/projects/recent", async (req, res) => {
  const rows = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt))
    .limit(10);
  res.json(rows);
});

router.get("/platform-breakdown", async (req, res) => {
  const projects = await db.select().from(projectsTable);
  const platforms = ["youtube_shorts", "tiktok", "reels", "x_clips", "all"];

  const breakdown = platforms.map((platform) => {
    const platformProjects = projects.filter(
      (p) => p.platform === platform || p.platform === "all"
    );
    const done = platformProjects.filter((p) => p.status === "done").length;
    const total = platformProjects.length;
    return {
      platform,
      count: total,
      successRate: total > 0 ? Math.round((done / total) * 1000) / 10 : 0,
    };
  });

  res.json(breakdown);
});

export default router;
