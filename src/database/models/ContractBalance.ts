import { Schema, model } from "mongoose";

export interface IContractBalance {
  address: string;
  balance: string;
  contractAddress: string;
}

const ContractBalanceSchema: Schema = new Schema({
  address: { type: String, lowercase: true, index: true },
  balance: { type: String },
  contractAddress: { type: String, lowercase: true, index: true },
});

export const ContractBalance = model<IContractBalance>("ContractBalance", ContractBalanceSchema);
