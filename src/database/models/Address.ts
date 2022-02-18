import { Schema, model } from "mongoose";

export interface IAddress {
  address: string;
  isContract: boolean;
}

const AddressSchema: Schema = new Schema({
  address: { type: String, lowercase: true },
  isContract: { type: Boolean },
});

export const Address = model<IAddress>("Address", AddressSchema);
