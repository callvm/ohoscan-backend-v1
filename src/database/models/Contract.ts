import { Schema, model } from "mongoose";

export enum ContractType {
    ERC20 = "ERC20",
    ERC721 = "ERC721",
    OTHER = "Other"
}

export interface IContract {
    name: string;
    symbol: string;
    address: string;
    owner?: string;
    imageUrl?: string;
    supply?: string;
    decimals?: number;
    type: ContractType;
}

const ContractSchema: Schema = new Schema({
    name: { type: String },
    symbol: { type: String },
    address: { type: String, lowercase: true },
    owner: { type: String, lowercase: true },
    supply: { type: String },
    decimals: { type: Number },
    imageUrl: { type: String },
    type: {
        type: String,
        enum: Object.values(ContractType),
        default: ContractType.ERC20,
    },
});

export const Contract = model<IContract>("Contract", ContractSchema);
