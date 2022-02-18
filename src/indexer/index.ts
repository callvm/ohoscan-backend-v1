import { config } from "../config";
import { Database } from "../database";
import { getBlocks, getChainHeight } from "../rpc";
import { IBlock, Block, ITransaction, Transaction } from "../database/models";
import { eventEmitter } from "..";
import { indexAddresses } from "./addressIndexer";
import { getTransactionTypes } from "./transactionIndexer";

export const indexLoop = async (db: Database) => {
  try {
    const concurrentRequests = Number(config.indexer.concurrentRequests);
    const blocksPerRequest = Number(config.indexer.blocksPerRequest);
    const concurrentBlocks = concurrentRequests * blocksPerRequest;
    const syncedBlockHeight = await db.getSyncedHeight(); //3716420
    const currentChainHeight = await getChainHeight();

    // From synced height + 1 to current height
    for (
      let outerIndex = syncedBlockHeight + 1;
      outerIndex <= currentChainHeight;
      outerIndex += concurrentBlocks
    ) {
      let requests = [];

      // Build the current batch, based on concurrentRequests (increment by blocksPerRequest, so it will take concurrentRequests amount of iterations to reach concurrentBlocks)
      for (
        let innerIndex = 0;
        innerIndex < concurrentBlocks;
        innerIndex += blocksPerRequest
      ) {
        let heights = [];

        if (outerIndex + innerIndex > currentChainHeight) break;

        // Build the requests in this batch, based on blocksPerRequest
        for (let blockIndex = 0; blockIndex < blocksPerRequest; blockIndex++) {
          let block = outerIndex + innerIndex + blockIndex;

          if (block > currentChainHeight) break;

          heights.push(block);
        }
        requests.push(getBlocks(heights));
      }

      // Fetch the blocks / transactions
      let blocks: IBlock[] = [];
      let transactions: ITransaction[] = [];
      let blockResults = await Promise.all(requests);

      console.log(outerIndex);

      // Format / flatten
      blockResults.forEach((res) => blocks.push(...res));
      blocks.forEach((block) => transactions.push(...block.transactions));

      await getTransactionTypes(transactions);

      await indexAddresses(
        transactions,
        outerIndex,
        outerIndex + concurrentBlocks - 1
      );

      // Write to DB
      await Block.insertMany(
        blocks.map((block) => {
          return {
            ...block,
            transactions: block.transactions.map((t) => t.hash),
          };
        })
      );
      await Transaction.insertMany(transactions);

      // Emit
      if (blocks.length > 0) eventEmitter.emit("blocks", blocks);
      if (transactions.length > 0)
        eventEmitter.emit("transactions", transactions);
    }
    indexLoop(db);
  } catch (e) {
    console.log(e);
    console.error("Error: Failed to process blocks, trying again");
    setTimeout(() => {
      indexLoop(db);
    }, 5000);
  }
};
