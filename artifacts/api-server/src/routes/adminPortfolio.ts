import { Router, type IRouter } from "express";
import { db, portfolioItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

// POST /api/admin/portfolio
router.post("/admin/portfolio", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { title, description, category, tags, imageUrl, featured, clientName, year } = req.body as {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
    featured?: boolean;
    clientName?: string | null;
    year?: number | null;
  };

  if (!title || !description || !category || !imageUrl) {
    res.status(400).json({ error: "title, description, category, imageUrl are required" });
    return;
  }

  const [item] = await db
    .insert(portfolioItemsTable)
    .values({
      title,
      description,
      category,
      tags: tags ?? [],
      imageUrl,
      featured: featured ?? false,
      clientName: clientName ?? null,
      year: year ?? null,
    })
    .returning();

  req.log.info({ id: item.id }, "Portfolio item created");
  res.status(201).json(item);
});

// PUT /api/admin/portfolio/:id
router.put("/admin/portfolio/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { title, description, category, tags, imageUrl, featured, clientName, year } = req.body as {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
    featured?: boolean;
    clientName?: string | null;
    year?: number | null;
  };

  if (!title || !description || !category || !imageUrl) {
    res.status(400).json({ error: "title, description, category, imageUrl are required" });
    return;
  }

  const [updated] = await db
    .update(portfolioItemsTable)
    .set({ title, description, category, tags: tags ?? [], imageUrl, featured: featured ?? false, clientName: clientName ?? null, year: year ?? null })
    .where(eq(portfolioItemsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Portfolio item not found" });
    return;
  }

  req.log.info({ id }, "Portfolio item updated");
  res.json(updated);
});

// DELETE /api/admin/portfolio/:id
router.delete("/admin/portfolio/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(portfolioItemsTable)
    .where(eq(portfolioItemsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Portfolio item not found" });
    return;
  }

  req.log.info({ id }, "Portfolio item deleted");
  res.sendStatus(204);
});

export default router;
