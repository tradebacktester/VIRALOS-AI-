import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import scriptsRouter from "./scripts";
import clipsRouter from "./clips";
import voiceoversRouter from "./voiceovers";
import captionsRouter from "./captions";
import videosRouter from "./videos";
import exportsRouter from "./exports";
import analyticsRouter from "./analytics";
import trendsRouter from "./trends";
import agentsRouter from "./agents";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use("/scripts", scriptsRouter);
router.use("/clips", clipsRouter);
router.use("/voiceovers", voiceoversRouter);
router.use("/captions", captionsRouter);
router.use("/videos", videosRouter);
router.use("/exports", exportsRouter);
router.use("/analytics", analyticsRouter);
router.use("/trends", trendsRouter);
router.use("/agents", agentsRouter);

export default router;
