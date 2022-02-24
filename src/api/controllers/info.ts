import { Router } from "express";
import { getContract } from "../services";

export const infoRouter = Router();

infoRouter.get("/summary", async (request, response, next) => {
  response.send("summary");
});