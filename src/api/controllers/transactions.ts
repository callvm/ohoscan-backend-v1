import { Router } from "express";
import { getLatestTransactions } from "../services";

export const transactionsRouter = Router();

transactionsRouter.get("/latest/:count", async (request, response, next) => {
  let transactions = await getLatestTransactions(Number(request.params.count));
  response.send(transactions);
});
