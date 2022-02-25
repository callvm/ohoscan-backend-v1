import Eth from "web3-eth";
import { config } from "../config";
import { Address, IAddress, ITransaction } from "../database/models";
import { getAddressCodes } from "../rpc";
import { createContract, getContractTransactions } from "./contractIndexer";

export const indexAddresses = async (transactionReceipts: any[], from: number, to: number) => {
  let addresses = getAddressesFromTransactions(transactionReceipts)
  let existingAddresses = await createOrFindAddresses(addresses)
  let contractAddresses = existingAddresses.filter(a => a.isContract).map(a => a.address)
  await getContractTransactions(contractAddresses, from, to);
};

export const createOrFindAddresses = async (addresses: string[]): Promise<IAddress[]> => {

  let existingAddresses: IAddress[] = await Address.find({ address: { "$in": addresses } })
  let addressesToCreate = addresses.filter(a => !existingAddresses.map(b => b.address).includes(a))
  let addressCodes = await getAddressCodes(addressesToCreate)
  let createdAddresses: IAddress[] = []

  for (let address of addressesToCreate) {
    let code = addressCodes.find((a: any) => a.id == address)
    let newAddress: IAddress = {
      address,
      isContract: code.result != "0x"
    }
    createdAddresses.push(newAddress)
    if (newAddress.isContract) {
      await createContract(newAddress.address)
    }
  }

  await Address.insertMany(createdAddresses)
  return existingAddresses.concat(createdAddresses)

}

const getAddressesFromTransactions = (receipts: any[]): string[] => {
  let addresses: string[] = []

  receipts.forEach((reciept: any) => {
    addresses.push(reciept.result.from, reciept.result.to)
    reciept.result.logs.forEach((log: any) => {
      addresses.push(log.address)
    })
  })

  return [...new Set(addresses.filter(a => a))]
}
