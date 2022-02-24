import dotenv from "dotenv";

dotenv.config();

export const config = {
  database: {
    connection: process.env.DATABASE_CONNECTION,
  },
  indexer: {
    rpcURL: process.env.RPC_URL,
    concurrentRequests: process.env.CONCURRENT_SYNC_REQUESTS,
    blocksPerRequest: process.env.BLOCKS_PER_SYNC_REQUEST,
  },
  ssl: {
    cert: process.env.SSL_CERT,
    ca: process.env.SSL_CA,
    key: process.env.SSL_KEY,
  },
  api: {
    port: process.env.API_PORT,
  },
  chain: {
    maxSupply: Number(process.env.MAX_SUPPLY)
  }
};
