import { Router, type IRouter } from "express";
import { db, projectRequestsTable } from "@workspace/db";
import { SubmitProjectRequestBody, SubmitProjectRequestResponse } from "@workspace/api-zod";
import { sendProjectRequestConfirmation, notifyAdminNewLead } from "../lib/email";

const router: IRouter = Router();

router.post("/project-requests", async (req, res): Promise<void> => {
  const parsed = SubmitProjectRequestBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid project request body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db
    .insert(projectRequestsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      projectType: parsed.data.projectType,
      industry: parsed.data.industry,
      budget: parsed.data.budget ?? null,
      goal: parsed.data.goal,
      phone: parsed.data.phone ?? null,
    })
    .returning();

  req.log.info({ id: record.id, email: record.email }, "Project request submitted");

  // Fire-and-forget emails
  void sendProjectRequestConfirmation(record.email, record.name, record.projectType);
  void notifyAdminNewLead(record.id, record.name, record.email, record.projectType);

  res.status(201).json(SubmitProjectRequestResponse.parse(record));
});

export default router;
