import { Router } from "express";
import { getLatestTransactions, getTransactionsPopulated } from "../services";

export const transactionsRouter = Router();

transactionsRouter.get("/latest", async (request, response, next) => {
  let transactions = await getTransactionsPopulated(17);
  response.send(transactions);
});

transactionsRouter.get("/latest/:count", async (request, response, next) => {
  let transactions = await getLatestTransactions(Number(request.params.count));
  response.send(transactions);
});
