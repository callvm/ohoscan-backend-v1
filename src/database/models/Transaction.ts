import { Schema, model } from "mongoose";
import { IContractTransaction } from ".";

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
  contractTransactions: IContractTransaction[];
}

const TransactionSchema: Schema = new Schema({
  blockHash: { type: String, index: true },
  from: { type: String, lowercase: true, index: true },
  hash: { type: String },
  input: { type: String },
  to: { type: String, lowercase: true, index: true },
  value: { type: String },

  blockNumber: { type: Number, index: true },
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

  contractTransactions: [{ type: Schema.Types.ObjectId, ref: 'ContractTransaction', required: false }]
});

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
