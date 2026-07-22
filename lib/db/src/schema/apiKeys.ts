import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";

export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  keyPrefix: text("key_prefix").notNull(), // first 8 chars for display
  usageCount: integer("usage_count").notNull().default(0),
  usageLimit: integer("usage_limit").notNull().default(1000),
  active: boolean("active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
});

export type InsertApiKey = Omit<InferInsertModel<typeof apiKeysTable>, "id" | "createdAt" | "lastUsedAt">;
export type ApiKey = typeof apiKeysTable.$inferSelect;
