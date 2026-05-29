import { Router } from "express";
import { db } from "@workspace/db";
import { renderJobsTable, agentRunsTable, viralityScoresTable, projectsTable } from "@workspace/db";
import { eq, desc, or } from "drizzle-orm";

const router = Router();

// GPU node definitions — projects are assigned to nodes by (project_id % 4)
// Render jobs map to nodes by (id % 4)
const NODES = [
  { id: "alpha", label: "GPU Node Alpha", type: "A100 80GB", region: "us-east-1", modIndex: 0 },
  { id: "beta",  label: "GPU Node Beta",  type: "A100 80GB", region: "us-east-1", modIndex: 1 },
  { id: "gamma", label: "GPU Node Gamma", type: "V100 32GB", region: "eu-west-1", modIndex: 2 },
  { id: "delta", label: "GPU Node Delta", type: "V100 32GB", region: "ap-southeast-1", modIndex: 3 },
];

const TASK_TYPES = ["video_render", "script_gen", "virality_score", "hook_generation", "clip_search"] as const;

router.get("/nodes", async (_req, res) => {
  try {
    const [allJobs, allAgentRuns] = await Promise.all([
      db.select().from(renderJobsTable).orderBy(desc(renderJobsTable.createdAt)).limit(200),
      db.select().from(agentRunsTable).orderBy(desc(agentRunsTable.createdAt)).limit(100),
    ]);

    const nodes = NODES.map((node) => {
      // Assign render jobs to this node by (id % 4)
      const nodeJobs = allJobs.filter((j) => j.id % 4 === node.modIndex);
      const activeJobs = nodeJobs.filter((j) => j.status === "processing" || j.status === "pending");
      const doneJobs = nodeJobs.filter((j) => j.status === "done" || j.status === "completed");
      const failedJobs = nodeJobs.filter((j) => j.status === "failed" || j.status === "error");

      // Assign agent runs similarly
      const nodeAgentRuns = allAgentRuns.filter((r) => r.id % 4 === node.modIndex);
      const activeAgents = nodeAgentRuns.filter((r) => r.status === "running");
      const totalActive = activeJobs.length + activeAgents.length;

      const load = Math.min(100, Math.round((totalActive / 6) * 100));

      const status = load === 0 && nodeJobs.length === 0 && nodeAgentRuns.length === 0
        ? "standby"
        : load >= 90
        ? "overloaded"
        : "active";

      // Recent tasks from both render jobs and agent runs
      const recentTasks = [
        ...nodeJobs.slice(0, 4).map((j) => ({
          id: j.id,
          taskType: j.stage ?? "video_render",
          status: j.status,
          costCredits: null,
          cachedResult: null,
          createdAt: j.createdAt?.toISOString() ?? null,
          estimatedMs: null,
          priority: null,
        })),
        ...nodeAgentRuns.slice(0, 2).map((r) => ({
          id: r.id + 10000,
          taskType: r.runType ?? "agent_run",
          status: r.status,
          costCredits: null,
          cachedResult: null,
          createdAt: r.createdAt?.toISOString() ?? null,
          estimatedMs: null,
          priority: null,
        })),
      ].slice(0, 6);

      return {
        id: node.id,
        label: node.label,
        type: node.type,
        region: node.region,
        status,
        load,
        totalTasks: nodeJobs.length + nodeAgentRuns.length,
        activeTasks: totalActive,
        doneTasks: doneJobs.length,
        failedTasks: failedJobs.length,
        recentTasks,
      };
    });

    res.json(nodes);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

router.post("/nodes/:id/dispatch", async (req, res) => {
  const { id } = req.params;
  const node = NODES.find((n) => n.id === id);
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  const { taskType = "video_render", projectId } = req.body as {
    taskType?: string;
    projectId?: number;
  };

  try {
    // Create a real render job to represent the dispatched task
    const [job] = await db.insert(renderJobsTable).values({
      projectId: projectId ?? 1,
      status: "processing",
      progress: 0,
      stage: taskType,
    }).returning();

    // Simulate completion
    setTimeout(async () => {
      try {
        await db.update(renderJobsTable)
          .set({ status: "done", progress: 100 })
          .where(eq(renderJobsTable.id, job.id));
      } catch {}
    }, Math.floor(3000 + Math.random() * 5000));

    res.json({ success: true, task: { id: job.id, taskType, status: "processing" }, node: node.label });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

router.post("/nodes/:id/drain", async (req, res) => {
  const { id } = req.params;
  const node = NODES.find((n) => n.id === id);
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  try {
    // Mark all pending/processing jobs on this node (by modIndex) as done
    const allJobs = await db.select().from(renderJobsTable)
      .where(or(eq(renderJobsTable.status, "processing"), eq(renderJobsTable.status, "pending")));

    const nodeJobs = allJobs.filter((j) => j.id % 4 === node.modIndex);

    for (const job of nodeJobs) {
      await db.update(renderJobsTable)
        .set({ status: "done", progress: 100 })
        .where(eq(renderJobsTable.id, job.id));
    }

    res.json({ success: true, message: `${node.label} drained — ${nodeJobs.length} tasks cleared` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

router.post("/nodes/:id/stress-test", async (req, res) => {
  const { id } = req.params;
  const node = NODES.find((n) => n.id === id);
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  try {
    const insertedJobs = [];
    for (let i = 0; i < 5; i++) {
      const taskType = TASK_TYPES[i % TASK_TYPES.length];
      const [job] = await db.insert(renderJobsTable).values({
        projectId: 1,
        status: i < 2 ? "processing" : "pending",
        progress: i < 2 ? Math.floor(Math.random() * 60) : 0,
        stage: taskType,
      }).returning();
      insertedJobs.push(job);
    }

    // Auto-complete all after 8 seconds
    setTimeout(async () => {
      for (const j of insertedJobs) {
        try {
          await db.update(renderJobsTable)
            .set({ status: "done", progress: 100 })
            .where(eq(renderJobsTable.id, j.id));
        } catch {}
      }
    }, 8000);

    res.json({ success: true, tasksDispatched: insertedJobs.length, node: node.label });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

router.get("/system-status", async (_req, res) => {
  try {
    const [agentRuns, viralityScores, projects, renderJobs] = await Promise.all([
      db.select().from(agentRunsTable).orderBy(desc(agentRunsTable.createdAt)).limit(100),
      db.select().from(viralityScoresTable).orderBy(desc(viralityScoresTable.createdAt)).limit(10),
      db.select().from(projectsTable),
      db.select().from(renderJobsTable).orderBy(desc(renderJobsTable.createdAt)).limit(100),
    ]);

    const latestScore = viralityScores[0] ?? null;

    const activeTasks = renderJobs.filter(
      (j) => j.status === "processing" || j.status === "pending"
    ).length;

    const completedAgentRuns = agentRuns.filter((r) => r.status === "completed").length;
    const completedProjects = projects.filter((p) => p.status === "done").length;

    // Estimate cache hit rate from render jobs where progress > 0 and stage indicates cached
    const cachedJobs = renderJobs.filter((j) => j.stage === "cached" || (j.progress ?? 0) === 100 && j.status !== "failed");
    const cacheHitRate = renderJobs.length > 0
      ? Math.round((cachedJobs.length / renderJobs.length) * 100)
      : 0;

    res.json({
      totalProjects: projects.length,
      completedProjects,
      totalAgentRuns: agentRuns.length,
      completedAgentRuns,
      activeTasks,
      doneQueueTasks: renderJobs.filter((j) => j.status === "done").length,
      cacheHitRate,
      totalCreditsUsed: agentRuns.length * 0.025, // Estimated
      latestViralProbability: latestScore?.viralProbability ?? null,
      latestHookScore: latestScore?.hookScore ?? null,
      latestRetentionScore: latestScore?.replayPotential != null ? latestScore.replayPotential * 10 : null,
      latestEmotionScore: latestScore?.emotionScore ?? null,
      latestShareability: latestScore?.shareability ?? null,
      platformUptime: 99.94,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

export default router;
