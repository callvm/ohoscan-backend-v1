import { Block, IBlock } from "../../database/models";

export const getBlock = async (id: string) => {
  let blocks = await Block.findOne(
    { $or: [{ hash: id }, { number: Number(id) }] },
    { __v: 0, _id: 0 }
  );
  return blocks;
};

export const getLatestBlocks = async (count: number) => {
  let blocks = await Block.find({}, { __v: 0, _id: 0 })
    .sort({ _id: -1 })
    .limit(count);
  return blocks as IBlock[];
};
