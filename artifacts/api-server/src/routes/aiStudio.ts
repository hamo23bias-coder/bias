import { Router, type IRouter } from "express";
import { db, apiKeysTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function generateApiKey(): string {
  return "bias_" + randomBytes(32).toString("hex");
}

// POST /api/ai/chat — public endpoint, requires API key in body
router.post("/ai/chat", async (req, res): Promise<void> => {
  const { message, apiKey, model, systemPrompt } = req.body as {
    message?: string;
    apiKey?: string;
    model?: string;
    systemPrompt?: string | null;
  };

  if (!message || !apiKey) {
    res.status(400).json({ error: "message and apiKey are required" });
    return;
  }

  // Validate API key
  const keyHash = hashKey(apiKey);
  const [keyRecord] = await db
    .select()
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.keyHash, keyHash), eq(apiKeysTable.active, true)));

  if (!keyRecord) {
    res.status(401).json({ error: "Invalid or inactive API key" });
    return;
  }

  if (keyRecord.usageCount >= keyRecord.usageLimit) {
    res.status(429).json({ error: "Usage limit exceeded for this API key" });
    return;
  }

  // Call OpenAI (or return mock if not configured)
  let reply = "";
  const selectedModel = model ?? "gpt-4o-mini";

  if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: message },
          ],
        }),
      });

      if (!response.ok) {
        logger.error({ status: response.status }, "OpenAI API error");
        res.status(500).json({ error: "AI service error" });
        return;
      }

      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      reply = data.choices[0]?.message?.content ?? "";
    } catch (err) {
      logger.error({ err }, "OpenAI fetch failed");
      res.status(500).json({ error: "AI service unavailable" });
      return;
    }
  } else {
    reply = `[Demo mode — OPENAI_API_KEY not set] You said: "${message}"`;
    logger.warn("OPENAI_API_KEY not configured, returning mock response");
  }

  // Increment usage
  await db
    .update(apiKeysTable)
    .set({
      usageCount: keyRecord.usageCount + 1,
      lastUsedAt: new Date(),
    })
    .where(eq(apiKeysTable.id, keyRecord.id));

  res.json({
    reply,
    model: selectedModel,
    usageCount: keyRecord.usageCount + 1,
    usageLimit: keyRecord.usageLimit,
  });
});

// GET /api/admin/api-keys
router.get("/admin/api-keys", requireAuth, async (_req: AuthRequest, res): Promise<void> => {
  const keys = await db
    .select({
      id: apiKeysTable.id,
      clientName: apiKeysTable.clientName,
      keyPrefix: apiKeysTable.keyPrefix,
      usageCount: apiKeysTable.usageCount,
      usageLimit: apiKeysTable.usageLimit,
      active: apiKeysTable.active,
      notes: apiKeysTable.notes,
      createdAt: apiKeysTable.createdAt,
      lastUsedAt: apiKeysTable.lastUsedAt,
    })
    .from(apiKeysTable)
    .orderBy(apiKeysTable.createdAt);

  res.json(keys);
});

// POST /api/admin/api-keys
router.post("/admin/api-keys", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { clientName, usageLimit, notes } = req.body as {
    clientName?: string;
    usageLimit?: number;
    notes?: string | null;
  };

  if (!clientName) {
    res.status(400).json({ error: "clientName is required" });
    return;
  }

  const key = generateApiKey();
  const keyHash = hashKey(key);
  const keyPrefix = key.slice(0, 12);

  const [record] = await db
    .insert(apiKeysTable)
    .values({
      clientName,
      keyHash,
      keyPrefix,
      usageLimit: usageLimit ?? 1000,
      notes: notes ?? null,
    })
    .returning();

  req.log.info({ id: record.id, clientName }, "API key created");

  res.status(201).json({
    id: record.id,
    clientName: record.clientName,
    keyPrefix: record.keyPrefix,
    key, // shown only once
    usageLimit: record.usageLimit,
  });
});

// DELETE /api/admin/api-keys/:id
router.delete("/admin/api-keys/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .update(apiKeysTable)
    .set({ active: false })
    .where(eq(apiKeysTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "API key not found" });
    return;
  }

  req.log.info({ id }, "API key revoked");
  res.sendStatus(204);
});

export default router;
