import Eth from "web3-eth";
import { config } from "../config";
import { ITransaction, TransactionType } from "../database/models";

const eth = new Eth(config.indexer.rpcURL!);

export const getTransactionTypes = async (transactions: ITransaction[]) => {
  for (let transaction of transactions) {
    if (!transaction.to) {
      transaction.transactionType = TransactionType.CONCTRACT_CREATION;
      let receipt = await eth.getTransactionReceipt(transaction.hash);
      transaction.to = receipt.contractAddress!;
    } else {
      transaction.transactionType = TransactionType.TRANSACTION;
    }
  }
};
