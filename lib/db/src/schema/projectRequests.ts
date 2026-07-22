import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";

export const projectRequestsTable = pgTable("project_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  projectType: text("project_type").notNull(),
  industry: text("industry").notNull(),
  budget: text("budget"),
  goal: text("goal").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("new"), // new | contacted | closed
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export type InsertProjectRequest = Omit<
  InferInsertModel<typeof projectRequestsTable>,
  "id" | "createdAt" | "updatedAt" | "status" | "notes"
>;
export type ProjectRequest = typeof projectRequestsTable.$inferSelect;
