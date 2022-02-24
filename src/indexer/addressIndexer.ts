import Eth from "web3-eth";
import { config } from "../config";
import { Address, IAddress, ITransaction } from "../database/models";
import { getAddressesFromTransactions } from "../rpc";
import { createContract, getContractTransactions } from "./contractIndexer";

const eth = new Eth(config.indexer.rpcURL!);

export const indexAddresses = async (transactions: ITransaction[], from: number, to: number) => {

  let addresses = await getAddressesFromTransactions(transactions)
  let contractAddresses: string[] = [];

  for (let address of addresses) {
    
    let existingAddress: IAddress = (await Address.findOne({ address })) as IAddress;

    // Create address / contract if we don't have it
    if (!existingAddress) {
      let code = await eth.getCode(address);
      existingAddress = { address, isContract: code != "0x" };
      await Address.insertMany(existingAddress);

      if (existingAddress.isContract) {
        await createContract(address);
      }
    }

    if (existingAddress.isContract)
      contractAddresses.push(existingAddress.address);
  }
  await getContractTransactions(contractAddresses, from, to);
};
