import { Router, type IRouter } from "express";
import { db, projectRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/admin/leads
router.get("/admin/leads", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { status } = req.query as { status?: string };

  let query = db
    .select()
    .from(projectRequestsTable)
    .orderBy(desc(projectRequestsTable.createdAt));

  const rows = status
    ? await db
        .select()
        .from(projectRequestsTable)
        .where(eq(projectRequestsTable.status, status))
        .orderBy(desc(projectRequestsTable.createdAt))
    : await query;

  res.json(rows);
});

// PATCH /api/admin/leads/:id/status
router.patch("/admin/leads/:id/status", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { status, notes } = req.body as { status?: string; notes?: string | null };
  const validStatuses = ["new", "contacted", "closed"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: "status must be one of: new, contacted, closed" });
    return;
  }

  const updateData: { status: string; notes?: string | null } = { status };
  if (notes !== undefined) updateData.notes = notes;

  const [updated] = await db
    .update(projectRequestsTable)
    .set(updateData)
    .where(eq(projectRequestsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  req.log.info({ id, status }, "Lead status updated");
  res.json(updated);
});

export default router;
