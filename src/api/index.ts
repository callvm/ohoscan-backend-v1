import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { eventEmitter } from "..";
import { blocksRouter, transactionsRouter } from "./controllers";


export const apiServer = async () => {
  const app = express();
  app.use(cors());
  app.use("/blocks", blocksRouter);
  app.use("/transactions", transactionsRouter);

  const server = http.createServer(app);
  createWebsocketServer(server);
  server.listen(3000, () => {
    console.log("listening on *:3000");
  });
};

const createWebsocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
      credentials: true,
    },
    allowEIO3: true,
  });
  io.on("connection", (socket: Socket) => {
    eventEmitter.on("blocks", (blocks) => {
      socket.emit("blocks", blocks);
    });
    eventEmitter.on("transactions", (transactions) => {
      socket.emit("transactions", transactions);
    });
  });
};
