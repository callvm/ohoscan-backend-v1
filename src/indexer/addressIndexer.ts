import Eth from "web3-eth";
import { Address, IAddress, ITransaction } from "../database/models";
import { createContract, getContractTransactions } from "./contractIndexer";

const eth = new Eth("https://api.oho.ai");

export const indexAddresses = async (
  transactions: ITransaction[],
  from: number,
  to: number
) => {
  let addresses: string[] = [];
  let contractAddresses: string[] = [];

  transactions.forEach((transaction) => {
    addresses.push(
      transaction.from.toLowerCase(),
      transaction.to.toLowerCase()
    );
  });

  addresses = [...new Set(addresses.filter((a) => a))];

  for (let address of addresses) {
    let existingAddress: IAddress = (await Address.findOne({
      address,
    })) as IAddress;
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
