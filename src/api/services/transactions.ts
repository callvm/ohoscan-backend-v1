import { Transaction } from "../../database/models";

export const getLatestTransactions = async (count: number) => {
  let transactions = await Transaction.find({}, { __v: 0, _id: 0 })
    .sort({ _id: -1 })
    .limit(count);
  return transactions;
};

export const getTransactionsPopulated = async (count: number) => {
  let transactions = await Transaction.find({}, { __v: 0, _id: 0, input: 0 })
    .sort({ _id: -1 })
    .limit(count)
    .populate('contractTransactions', '-_id -__v')
    .lean()
    .exec();
    return transactions
}

export const getTransactionCount = async () => {
  let count = await Transaction.count({})
  return count
}
