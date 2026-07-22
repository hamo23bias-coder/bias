import { Router, type IRouter } from "express";
import { db, portfolioItemsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ListPortfolioItemsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/portfolio", async (req, res): Promise<void> => {
  const items = await db
    .select()
    .from(portfolioItemsTable)
    .orderBy(desc(portfolioItemsTable.featured), desc(portfolioItemsTable.year));

  res.json(ListPortfolioItemsResponse.parse(items));
});

export default router;
