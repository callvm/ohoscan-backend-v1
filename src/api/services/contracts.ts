import { Contract } from "../../database/models";

export const getContract = async (id: string) => {
  let contract = await Contract.findOne(
    { $or: [{ name: id }, { symbol: id }, { address: id }] },
    { __v: 0, _id: 0 }
  );
  return contract;
};

export const getContractCount = async () => {
  let count = await Contract.count({})
  return count
}