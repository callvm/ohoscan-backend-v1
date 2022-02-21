import { Router } from "express";
import { getContract } from "../services";

export const contractsRouter = Router();

contractsRouter.get("/:id", async (request, response, next) => {
  let contract = await getContract(request.params.id);
  response.send(contract);
});