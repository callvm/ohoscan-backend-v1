const fetch = require("node-fetch");
import { config } from "../config";
import { IBlock, ITransaction } from "../database/models";
import Eth from "web3-eth";

const eth = new Eth(config.indexer.rpcURL!);

export const getBlocks = async (blockHeights: number[]): Promise<IBlock[]> => {
  let blocks: IBlock[] = [];

  let requestBodies: ApiRequestBody[] = blockHeights.map((height) => {
    {
      let body: ApiRequestBody = {
        method: "eth_getBlockByNumber",
        params: [height.toString(), true],
      };
      return body;
    }
  });
  let requests = generateRequest(requestBodies);
  let response = await requests;
  let json = await response.json();

  json.forEach((result: any) => {
    let block: IBlock = {
      ...result.result,
      difficulty: parseInt(result.result.difficulty, 16),
      totalDifficulty: parseInt(result.result.totalDifficulty, 16),
      number: parseInt(result.result.number, 16),
      size: parseInt(result.result.size, 16),
      gasLimit: parseInt(result.result.gasLimit, 16),
      gasUsed: parseInt(result.result.gasUsed, 16),
      timestamp: parseInt(result.result.timestamp, 16),
      nonce: parseInt(result.result.nonce, 16),
      transactions: getTransactions(
        result.result.transactions,
        result.result.timestamp
      ),
    };
    blocks.push(block);
  });

  return blocks;
};

export const getChainHeight = async (): Promise<number> => {
  let height: number;
  try {
    let requestBody: ApiRequestBody = { method: "eth_blockNumber", params: [] };
    let request = generateRequest([requestBody]);
    let response = await request;
    let json = await response.json();
    height = parseInt(json[0].result, 16);
  } catch (e) {
    throw console.error("Error: Can't get chain height");
  }
  return height;
};

export const getGasPrice = async (): Promise<string> => {
  let gasPrice = await eth.getGasPrice()
  return gasPrice
}

export const getTransactionReceipts = async (transactionHashes: string[]) => {

  if (transactionHashes.length == 0) return []

  let requestBodies: ApiRequestBody[] = transactionHashes.map((transaction) => {
    {
      let body: ApiRequestBody = {
        method: "eth_getTransactionReceipt",
        params: [transaction],
      };
      return body;
    }
  });
  let requests = generateRequest(requestBodies);
  let response = await requests;
  let json = await response.json();
  return json
}

export const getAddressCodes = async (addresses: string[]) => {
  if (addresses.length == 0) return []
  let requestBodies: ApiRequestBody[] = addresses.map((address) => {
    {
      let body: ApiRequestBody = {
        method: "eth_getCode",
        params: [address, "latest"],
        id: address
      };
      return body;
    }
  });
  let requests = generateRequest(requestBodies);
  let response = await requests;
  let json = await response.json();
  return json
}

const generateRequest = (apiRequests: ApiRequestBody[]) => {
  const url = config.indexer.rpcURL!;
  let body: any[] = [];
  apiRequests.forEach((request) => {
    body.push({
      jsonrpc: "2.0",
      id: request.id || 1,
      method: request.method,
      params: request.params,
    });
  });
  const request = {
    method: "POST",
    body: JSON.stringify(body),
  };
  return fetch(url, request);
};

const getTransactions = (transactions: any, timestamp: any): ITransaction[] => {
  let results: ITransaction[] = [];

  transactions.forEach((transaction: any) => {
    let result: ITransaction = {
      ...transaction,
      blockNumber: parseInt(transaction.blockNumber, 16),
      gas: parseInt(transaction.gas, 16),
      gasPrice: parseInt(transaction.gasPrice, 16),
      nonce: parseInt(transaction.nonce, 16),
      timestamp: parseInt(timestamp, 16),
      transactionIndex: parseInt(transaction.transactionIndex, 16),
    };
    results.push(result);
  });

  return results;
};

interface ApiRequestBody {
  method: string;
  params: any[];
  id?: string;
}
