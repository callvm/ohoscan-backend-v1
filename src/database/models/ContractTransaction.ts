import { Schema, model } from "mongoose";

export enum ContractTransactionType {
  TRANSFER = "Token Transfer",
  MINTING = "Token Minting",
  CREATION = "Token Creation",
  CALL = "Contract Call"
}

export interface IContractTransaction {
  blockNumber: number;
  transactionIndex: number;

  blockHash: string;
  transactionHash: string;
  contractAddress: string;
  from: string;
  to: string;
  value?: string;

  type: ContractTransactionType;
}

const ContractTransactionSchema: Schema = new Schema({
  blockNumber: { type: Number, index: true },
  transactionIndex: { type: Number },

  blockHash: { type: String },
  transactionHash: { type: String, index: true },
  contractAddress: { type: String, lowercase: true, index: true },
  from: { type: String, lowercase: true },
  to: { type: String, lowercase: true },
  value: { type: String },

  type: {
    type: String,
    enum: Object.values(ContractTransactionType),
    default: ContractTransactionType.TRANSFER,
  },
});

export const ContractTransaction = model<IContractTransaction>("ContractTransaction", ContractTransactionSchema);
