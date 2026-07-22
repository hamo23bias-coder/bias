/**
 * Seeds an initial admin user if none exists.
 * Run once on startup.
 */
import bcrypt from "bcryptjs";
import { db, adminUsersTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function seedAdminUser() {
  try {
    const [existing] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminUsersTable);

    if (existing.count > 0) return;

    const defaultEmail = process.env.ADMIN_EMAIL ?? "admin@bias.tech";
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? "Bias@2025!";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    await db.insert(adminUsersTable).values({
      email: defaultEmail,
      passwordHash,
      name: "Admin",
      role: "admin",
    });

    logger.info({ email: defaultEmail }, "Default admin user seeded — change password immediately!");
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
}
