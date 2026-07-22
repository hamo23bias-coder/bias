import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectRequestsRouter from "./projectRequests";
import portfolioRouter from "./portfolio";
import authRouter from "./auth";
import adminLeadsRouter from "./adminLeads";
import adminPortfolioRouter from "./adminPortfolio";
import blogRouter from "./blog";
import analyticsRouter from "./analytics";
import aiStudioRouter from "./aiStudio";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectRequestsRouter);
router.use(portfolioRouter);
router.use(authRouter);
router.use(adminLeadsRouter);
router.use(adminPortfolioRouter);
router.use(blogRouter);
router.use(analyticsRouter);
router.use(aiStudioRouter);

export default router;
