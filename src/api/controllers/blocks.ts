import { Router } from "express";
import { getBlock, getLatestBlocks } from "../services";

export const blocksRouter = Router();

blocksRouter.get("/:id", async (request, response, next) => {
  let blocks = await getBlock(request.params.id);
  response.send(blocks);
});

blocksRouter.get("/latest/:count", async (request, response, next) => {
  let blocks = await getLatestBlocks(Number(request.params.count));
  response.send(blocks);
});
