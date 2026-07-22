import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"), // admin | staff
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type InsertAdminUser = Omit<InferInsertModel<typeof adminUsersTable>, "id" | "createdAt" | "updatedAt">;
export type AdminUser = typeof adminUsersTable.$inferSelect;
