import { Transaction } from "../../database/models";

export const getLatestTransactions = async (count: number) => {
  let blocks = await Transaction.find({}, { __v: 0, _id: 0 })
    .sort({ _id: -1 })
    .limit(count);
  return blocks;
};
