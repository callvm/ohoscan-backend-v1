import { ERC20ABI, ERC721ABI } from "./contracts";
import { config } from "../config";
import { ContractBalance, IContractBalance } from "../database/models/ContractBalance";
import { Contract, ContractTransaction, ContractTransactionType, ContractType, IContract, IContractTransaction } from "../database/models";
import Web3 from "web3";

const web3 = new Web3(config.indexer.rpcURL!);
const BURN_ADDRESS = "0x0000000000000000000000000000000000000000";
const TRANSACTION_EVENTS = ["Transfer", "Approval"]

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
        result = { name, symbol, supply, owner, address, type, decimals: Number(decimals) };
    } else if (type == ContractType.ERC721) {
        let calls = [contract.methods.name().call(), contract.methods.symbol().call(), contract.methods.owner().call()];
        let [name, symbol, owner] = await Promise.all(calls);
        result = { name, symbol, owner, address, type };
    } else {
        return
    }

    await Contract.insertMany(result);
};

export const getContractTransactions = async (contractAddresses: string[], fromBlock: number, toBlock: number) => {

    for (let contractAddress of contractAddresses) {

        let existingContract = await Contract.findOne({ address: contractAddress }) as IContract;
        if (!existingContract){
            continue;
        }
        let abi = existingContract.type == ContractType.ERC20 ? ERC20ABI : ERC721ABI;
        let contract = new web3.eth.Contract(abi, contractAddress);
        let transactions = await contract.getPastEvents("allEvents", { fromBlock, toBlock });

        transactions = transactions.filter(transaction => TRANSACTION_EVENTS.includes(transaction.event))
        await saveContractTransactions(transactions, existingContract.type);
        if (existingContract.type == ContractType.ERC20) {
            await updateContractBalances(transactions);
        }
    }
};

const saveContractTransactions = async (transactions: any[], contractType: ContractType) => {

    let contractTransactions: IContractTransaction[] = [];

    transactions.forEach((transaction) => {

        let contractTransaction: IContractTransaction;

        switch (transaction.event) {
            case "Transfer": {
                contractTransaction = {
                    ...transaction,
                    contractAddress: transaction.address.toLowerCase(),
                    from: transaction.returnValues.from.toLowerCase(),
                    to: transaction.returnValues.to.toLowerCase(),
                    type: ContractTransactionType.TRANSFER,
                };

                if (contractType == ContractType.ERC20) {
                    contractTransaction.value = transaction.returnValues.value;
                }

                if (contractTransaction.from == BURN_ADDRESS) {
                    contractTransaction.type = ContractTransactionType.MINTING;
                }
                break;
            }
            case "Approval": {
                contractTransaction = {
                    ...transaction,
                    contractAddress: transaction.address.toLowerCase(),
                    from: transaction.returnValues._owner.toLowerCase(),
                    to: transaction.address.toLowerCase(),
                    type: ContractTransactionType.CALL,
                };
                break;
            }
            default: {
                return;
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

        transactions.forEach((transaction) => {
            switch (transaction.event) {
                case "Approval": {
                    addresses.push(transaction.returnValues._owner)
                    break;
                }
                case "Transfer": {
                    addresses.push(transaction.returnValues.to, transaction.returnValues.from)
                    break
                }
                default: break
            }
        });

        addresses = [...new Set(addresses.filter(address => address != BURN_ADDRESS))];

        for (let address of addresses) {

            let existingBalance = await ContractBalance.findOne({ address, contractAddress });
            let balance = await contract.methods.balanceOf(address).call();

            if (existingBalance) {
                existingBalance.balance = balance;
                await existingBalance.save();
            } else {
                let newBalance: IContractBalance = { address, balance, contractAddress };
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
        try {
            await contract.methods.name().call();
            return ContractType.ERC721;
        } catch {
            return ContractType.OTHER
        }
    }
};
