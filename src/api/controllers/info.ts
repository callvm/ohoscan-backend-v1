import { Router } from "express";
import { getContract, getSummary } from "../services";

export const infoRouter = Router();

infoRouter.get("/summary", async (request, response, next) => {
    let summary = await getSummary()
    response.send(summary);
});