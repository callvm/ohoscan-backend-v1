import { Address } from "../../database/models";

export const getAddressCount = async () => {
 let count = await Address.count({})
 return count
}