import Eth from "web3-eth";
import { ITransaction, TransactionType } from "../database/models";

const eth = new Eth("https://api.oho.ai");

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
