import cron from "node-cron";
import { db, projectRequestsTable } from "@workspace/db";
import { eq, lt, and } from "drizzle-orm";
import { sendFollowUpEmail } from "./email";
import { logger } from "./logger";

/**
 * Every hour: check for leads that are still "new" after 48h and send a follow-up email.
 */
export function startCronJobs() {
  cron.schedule("0 * * * *", async () => {
    logger.info("Running follow-up email cron");

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const staleLeads = await db
      .select()
      .from(projectRequestsTable)
      .where(and(eq(projectRequestsTable.status, "new"), lt(projectRequestsTable.createdAt, cutoff)));

    for (const lead of staleLeads) {
      await sendFollowUpEmail(lead.email, lead.name, lead.id);
      // Mark as contacted so we don't spam
      await db
        .update(projectRequestsTable)
        .set({ status: "contacted" })
        .where(eq(projectRequestsTable.id, lead.id));
    }

    if (staleLeads.length > 0) {
      logger.info({ count: staleLeads.length }, "Follow-up emails sent");
    }
  });

  logger.info("Cron jobs started");
}
