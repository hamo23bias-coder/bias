import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  author: text("author").notNull(),
  tags: text("tags").array().notNull().default([]),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type InsertBlogPost = Omit<InferInsertModel<typeof blogPostsTable>, "id" | "createdAt" | "updatedAt">;
export type BlogPost = typeof blogPostsTable.$inferSelect;
