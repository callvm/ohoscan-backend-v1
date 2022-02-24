import { getAddressCount, getContractCount, getLatestBlocks, getTransactionCount } from ".";
import { Block, IBlock, Contract } from "../../database/models";
import { getGasPrice } from "../../rpc";
import * as moment from 'moment'
import { ISummary } from "./models/Summary";
import { config } from "../../config";

export const getSummary = async (): Promise<ISummary> => {

    //TODO - bring in price from external API and calculate market cap

    let price = 0.05
    let marketCap = price * config.chain.maxSupply

    let calls = [getGasPrice(), getLatestBlocks(100), getTransactionCount(), getContractCount(), getAddressCount()]
    let response = await Promise.all(calls)

    let gasPrice = response[0] as string
    let blocks = response[1] as IBlock[]
    let transactionCount = response[2] as number
    let contractCount = response[3] as number
    let addressCount = response[4] as number

    let averageBlockTime = moment.duration((blocks[0].timestamp - blocks[99].timestamp) / 100, 's').asSeconds()

    let result: ISummary = { gasPrice, averageBlockTime, transactionCount, contractCount, addressCount, price, marketCap }

    return result
};