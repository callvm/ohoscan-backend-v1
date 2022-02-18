import { Database } from "./database";
import { indexLoop } from "./indexer";
import { apiServer } from "./api";
import { EventEmitter } from "events";

export const eventEmitter = new EventEmitter();

const run = async () => {
  try {
    let db = new Database();
    await db.connect();

    if (db.isConnected) {
      console.log("connected");
      await apiServer();
      await indexLoop(db);
    }
  } catch (e) {}
};

run();
