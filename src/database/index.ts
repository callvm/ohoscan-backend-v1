import mongoose from "mongoose";
import { config } from "../config";
import { Block, IBlock } from "./models";

export class Database {
	isConnected: boolean;

	constructor() {
		this.isConnected = false;
	}

	async connect() {
		try {
			await mongoose.connect(config.database.connection!, { connectTimeoutMS: 5000 });
			this.isConnected = true;
		} catch (e) {
			throw console.error("Error: Can't connect to database");
		}
	}

	async getSyncedHeight() {
		let height: number;
		try {
			let block: IBlock[] = await Block.find({}).sort({ _id: -1 }).limit(1);
			if (block[0]) {
				height = block[0].number;
			} else {
				height = 0;
			}
		} catch (e) {
			throw console.error("Error: Can't get synced height from database");
		}
		return height;
	}
}
