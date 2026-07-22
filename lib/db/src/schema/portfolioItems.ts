import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";

export const portfolioItemsTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").notNull().default(false),
  clientName: text("client_name"),
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertPortfolioItem = Omit<InferInsertModel<typeof portfolioItemsTable>, "id" | "createdAt">;
export type PortfolioItem = typeof portfolioItemsTable.$inferSelect;
