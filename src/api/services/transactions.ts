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
    .populate('contractTransaction', '-_id -__v')
    .lean()
    .exec();
    return transactions
}
