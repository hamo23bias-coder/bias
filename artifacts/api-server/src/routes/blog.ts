import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/blog — published posts only
router.get("/blog", async (_req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.published, true))
    .orderBy(desc(blogPostsTable.publishedAt));
  res.json(posts);
});

// GET /api/blog/:slug
router.get("/blog/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.slug, slug));

  if (!post || !post.published) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(post);
});

// GET /api/admin/blog — all posts (admin)
router.get("/admin/blog", requireAuth, async (_req: AuthRequest, res): Promise<void> => {
  const posts = await db
    .select()
    .from(blogPostsTable)
    .orderBy(desc(blogPostsTable.createdAt));
  res.json(posts);
});

// POST /api/admin/blog
router.post("/admin/blog", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { title, slug, excerpt, content, coverImageUrl, author, tags, published } = req.body as {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImageUrl?: string | null;
    author?: string;
    tags?: string[];
    published?: boolean;
  };

  if (!title || !slug || !author) {
    res.status(400).json({ error: "title, slug, author are required" });
    return;
  }

  const [post] = await db
    .insert(blogPostsTable)
    .values({
      title,
      slug,
      excerpt: excerpt ?? "",
      content: content ?? "",
      coverImageUrl: coverImageUrl ?? null,
      author,
      tags: tags ?? [],
      published: published ?? false,
      publishedAt: published ? new Date() : null,
    })
    .returning();

  req.log.info({ id: post.id }, "Blog post created");
  res.status(201).json(post);
});

// PUT /api/admin/blog/:id
router.put("/admin/blog/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { title, slug, excerpt, content, coverImageUrl, author, tags, published } = req.body as {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImageUrl?: string | null;
    author?: string;
    tags?: string[];
    published?: boolean;
  };

  if (!title || !slug || !author) {
    res.status(400).json({ error: "title, slug, author are required" });
    return;
  }

  // Fetch existing to preserve publishedAt if already set
  const [existing] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const publishedAt = published && !existing.publishedAt ? new Date() : existing.publishedAt;

  const [updated] = await db
    .update(blogPostsTable)
    .set({ title, slug, excerpt: excerpt ?? "", content: content ?? "", coverImageUrl: coverImageUrl ?? null, author, tags: tags ?? [], published: published ?? false, publishedAt })
    .where(eq(blogPostsTable.id, id))
    .returning();

  req.log.info({ id }, "Blog post updated");
  res.json(updated);
});

// DELETE /api/admin/blog/:id
router.delete("/admin/blog/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(blogPostsTable)
    .where(eq(blogPostsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
