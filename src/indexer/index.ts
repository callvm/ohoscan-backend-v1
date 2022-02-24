import { config } from "../config";
import { Database } from "../database";
import { getBlocks, getChainHeight } from "../rpc";
import { IBlock, Block, ITransaction, Transaction, ContractTransaction, IContractTransaction } from "../database/models";
import { eventEmitter } from "..";
import { indexAddresses } from "./addressIndexer";
import { getTransactionTypes } from "./transactionIndexer";

export const indexLoop = async (db: Database) => {
    try {
        const concurrentRequests = Number(config.indexer.concurrentRequests);
        const blocksPerRequest = Number(config.indexer.blocksPerRequest);
        const concurrentBlocks = concurrentRequests * blocksPerRequest;
        const syncedBlockHeight = await db.getSyncedHeight();
        const currentChainHeight = await getChainHeight();

        // From synced height + 1 to current height
        for (let outerIndex = syncedBlockHeight + 1; outerIndex <= currentChainHeight; outerIndex += concurrentBlocks) {

            let requests = [];

            // Build the current batch, based on concurrentRequests (increment by blocksPerRequest, so it will take concurrentRequests amount of iterations to reach concurrentBlocks)
            for (let innerIndex = 0; innerIndex < concurrentBlocks; innerIndex += blocksPerRequest) {
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

            // Format / flatten
            blockResults.forEach((res) => blocks.push(...res));
            blocks.forEach((block) => transactions.push(...block.transactions));

            await getTransactionTypes(transactions);

            await indexAddresses(transactions, outerIndex, outerIndex + concurrentBlocks - 1);

            // Write to DB
            await Block.insertMany(
                blocks.map((block) => {
                    return {
                        ...block,
                        transactions: block.transactions.map((t) => t.hash),
                    };
                })
            );

            let contractTransactions = await ContractTransaction.find({ transactionHash: { "$in": transactions.map(t => t.hash) } })

            transactions.forEach(transaction => {
                transaction.contractTransactions = new Array<IContractTransaction>()
                let existingContractTransactions = contractTransactions.filter(ct => ct.transactionHash == transaction.hash)
                existingContractTransactions.forEach(tx => {
                    transaction.contractTransactions.push(tx._id)
                })
            })

            await Transaction.insertMany(transactions);

            console.log(outerIndex)

            // Emit
            if (blocks.length > 0) eventEmitter.emit("blocks", blocks);
            if (transactions.length > 0) eventEmitter.emit("transactions", transactions);
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
