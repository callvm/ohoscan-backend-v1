
import { ERC20ABI, ERC721ABI } from "./contracts";
import {
  ContractBalance,
  IContractBalance,
} from "../database/models/ContractBalance";
import {
  Contract,
  ContractTransaction,
  ContractTransactionType,
  ContractType,
  IContract,
  IContractTransaction,
} from "../database/models";
import Web3 from 'web3'

const web3 = new Web3("https://api.oho.ai");
const BURN_ADDRESS = "0x0000000000000000000000000000000000000000";

export const createContract = async (address: string) => {
  let result: IContract;
  let contract = new web3.eth.Contract(ERC20ABI, address);
  let type = await getContractType(contract);

  if (type == ContractType.ERC20) {
    let calls = [
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.totalSupply().call(),
      contract.methods.decimals().call(),
      contract.methods.owner().call(),
    ];
    let [name, symbol, supply, decimals, owner] = await Promise.all(calls);
    result = {
      name,
      symbol,
      supply,
      owner,
      address,
      type,
      decimals: Number(decimals),
    };
  } else {
    let calls = [
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.owner().call(),
    ];
    let [name, symbol, owner] = await Promise.all(calls);
    result = { name, symbol, owner, address, type };
  }

  await Contract.insertMany(result);
};

export const getContractTransactions = async (
  contractAddresses: string[],
  fromBlock: number,
  toBlock: number
) => {
  for (let contractAddress of contractAddresses) {
    let existingContract = (await Contract.findOne({
      address: contractAddress,
    })) as IContract;
    if (!existingContract) return;
    let abi =
      existingContract.type == ContractType.ERC20 ? ERC20ABI : ERC721ABI;
    let contract = new web3.eth.Contract(abi, contractAddress);
    let transactions = await contract.getPastEvents("Transfer", {
      fromBlock,
      toBlock,
    });
    await saveContractTransactions(transactions, existingContract.type);
    if (existingContract.type == ContractType.ERC20) {
      await updateContractBalances(transactions);
    }
  }
};

const saveContractTransactions = async (
  transactions: any[],
  contractType: ContractType
) => {
  let contractTransactions: IContractTransaction[] = [];
  transactions.forEach((transaction) => {
    let contractTransaction: IContractTransaction = {
      ...transaction,
      contractAddress: transaction.address.toLowerCase(),
      from: transaction.returnValues.from.toLowerCase(),
      to: transaction.returnValues.to.toLowerCase(),
      type: ContractTransactionType.TRANSFER,
    };

    if (contractType == ContractType.ERC20) {
      contractTransaction.value = transaction.returnValues.value;
    } else {
      if (contractTransaction.from == BURN_ADDRESS) {
        contractTransaction.type = ContractTransactionType.MINTING;
      }
    }
    contractTransactions.push(contractTransaction);
  });
  await ContractTransaction.insertMany(contractTransactions);
};

const updateContractBalances = async (transactions: any[]) => {
  if (transactions.length > 0) {
    let addresses: string[] = [];
    let newBalances: IContractBalance[] = [];
    let contractAddress = transactions[0].address;
    let contract = new web3.eth.Contract(ERC20ABI, contractAddress);

    transactions.forEach((transaction) =>
      addresses.push(transaction.returnValues.to, transaction.returnValues.from)
    );
    addresses = [...new Set(addresses)];

    for (let address of addresses) {
      let existingBalance = await ContractBalance.findOne({
        address,
        contractAddress,
      });
      let balance = await contract.methods.balanceOf(address).call();

      if (existingBalance) {
        existingBalance.balance = balance;
        await existingBalance.save();
      } else {
        let newBalance: IContractBalance = {
          address,
          balance,
          contractAddress,
        };
        newBalances.push(newBalance);
      }
    }
    await ContractBalance.insertMany(newBalances);
  }
};

const getContractType = async (contract: any) => {
  try {
    await contract.methods.totalSupply().call();
    // It works, must be ERC20
    return ContractType.ERC20;
  } catch {
    return ContractType.ERC721;
  }
};
