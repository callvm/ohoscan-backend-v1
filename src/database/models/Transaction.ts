import { Schema, model } from "mongoose";

export enum TransactionType {
  TRANSACTION = "Transaction",
  CONCTRACT_CREATION = "Contract Creation",
}

export interface ITransaction {
  blockHash: string;
  from: string;
  hash: string;
  input: string;
  to: string;
  value: string;

  blockNumber: number;
  gas: number;
  gasPrice: number;
  nonce: number;
  timestamp: number;
  transactionIndex: number;

  transactionType: TransactionType;
}

const TransactionSchema: Schema = new Schema({
  blockHash: { type: String },
  from: { type: String, lowercase: true },
  hash: { type: String },
  input: { type: String },
  to: { type: String, lowercase: true },
  value: { type: String },

  blockNumber: { type: Number },
  gas: { type: Number },
  gasPrice: { type: Number },
  nonce: { type: Number },
  timestamp: { type: Number },
  transactionIndex: { type: Number },

  transactionType: {
    type: String,
    enum: Object.values(TransactionType),
    default: TransactionType.TRANSACTION,
  },
});

export const Transaction = model<ITransaction>(
  "Transaction",
  TransactionSchema
);
