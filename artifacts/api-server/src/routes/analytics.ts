import { Router, type IRouter } from "express";
import { db, pageViewsTable, projectRequestsTable } from "@workspace/db";
import { gte, sql, desc, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

// POST /api/analytics/pageview
router.post("/analytics/pageview", async (req, res): Promise<void> => {
  const { path, referrer, sessionId } = req.body as {
    path?: string;
    referrer?: string | null;
    sessionId?: string | null;
  };

  if (!path) {
    res.status(400).json({ error: "path is required" });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null;
  const userAgent = req.headers["user-agent"] ?? null;

  await db.insert(pageViewsTable).values({
    path,
    referrer: referrer ?? null,
    sessionId: sessionId ?? null,
    ip,
    userAgent,
  });

  res.status(201).json({ ok: true });
});

// GET /api/admin/analytics
router.get("/admin/analytics", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const days = parseInt((req.query.days as string) ?? "30", 10);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total views in period
  const [{ total }] = await db
    .select({ total: count() })
    .from(pageViewsTable)
    .where(gte(pageViewsTable.createdAt, since));

  // Unique paths
  const pathRows = await db
    .select({ path: pageViewsTable.path, cnt: count().as("cnt") })
    .from(pageViewsTable)
    .where(gte(pageViewsTable.createdAt, since))
    .groupBy(pageViewsTable.path)
    .orderBy(desc(sql`cnt`))
    .limit(10);

  // Total leads in period
  const [{ leadsTotal }] = await db
    .select({ leadsTotal: count() })
    .from(projectRequestsTable)
    .where(gte(projectRequestsTable.createdAt, since));

  // Recent leads (last 7 days)
  const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [{ recentLeads }] = await db
    .select({ recentLeads: count() })
    .from(projectRequestsTable)
    .where(gte(projectRequestsTable.createdAt, recentSince));

  const conversionRate = total > 0 ? parseFloat(((leadsTotal / total) * 100).toFixed(2)) : 0;

  res.json({
    totalViews: total,
    uniquePaths: pathRows.length,
    topPages: pathRows.map((r) => ({ path: r.path, count: r.cnt })),
    conversionRate,
    leadsCount: leadsTotal,
    recentLeads,
  });
});

export default router;
