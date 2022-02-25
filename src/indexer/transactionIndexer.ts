import { ContractTransaction, IContractTransaction, ITransaction, Transaction, TransactionType } from "../database/models";

export const indexTransactions = async(transactions: ITransaction[], receipts: any[]) => {

  determineTransactionTypes(transactions, receipts)

  let contractTransactions = await ContractTransaction.find({ transactionHash: { "$in": transactions.map(t => t.hash) } })

  transactions.forEach(transaction => {
      transaction.contractTransactions = new Array<IContractTransaction>()
      let existingContractTransactions = contractTransactions.filter(ct => ct.transactionHash == transaction.hash)
      existingContractTransactions.forEach(tx => {
          transaction.contractTransactions.push(tx._id)
      })
  })

  await Transaction.insertMany(transactions);
}

export const determineTransactionTypes = async (transactions: ITransaction[], receipts: any[]) => {
  for (let transaction of transactions) {
    if (!transaction.to) {
      transaction.transactionType = TransactionType.CONCTRACT_CREATION;
      let receipt = receipts.find(r => r.result.transactionHash == transaction.hash)
      transaction.to = receipt.contractAddress!;
    } else {
      transaction.transactionType = TransactionType.TRANSACTION;
    }
  }
};
