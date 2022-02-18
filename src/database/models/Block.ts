import { Schema, model } from "mongoose";
import { ITransaction } from "./Transaction";

export interface IBlock {
  hash: string;
  parentHash: string;
  stateRoot: string;
  miner: string;
  extraData: string;

  difficulty: number;
  totalDifficulty: number;
  number: number;
  size: number;
  gasLimit: number;
  gasUsed: number;
  timestamp: number;
  nonce: number;

  transactions: ITransaction[];
  uncles: string[];
}

const BlockSchema: Schema = new Schema({
  hash: { type: String },
  parentHash: { type: String },
  stateRoot: { type: String },
  miner: { type: String },
  extraData: { type: String },

  difficulty: { type: Number },
  totalDifficulty: { type: Number },
  number: { type: Number },
  size: { type: Number },
  gasLimit: { type: Number },
  gasUsed: { type: Number },
  timestamp: { type: Number },
  nonce: { type: Number },

  transactions: { type: [String] },
  uncles: { type: [String] },
});

export const Block = model<IBlock>("Block", BlockSchema);
