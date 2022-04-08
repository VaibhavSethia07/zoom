import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("Home");
});

const handleListen = () => {
  console.log(`🚀 Server is listening at port ${PORT}...`);
  console.log(`[app]: http://localhost:${PORT}`);
};

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const sockets = [];
server.listen(PORT, handleListen);

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  sockets.push(socket);

  socket.on("message", (message) => {
    sockets.forEach((aSocket) => {
      console.log(message.toString("utf-8"));
      const parsedMessage = JSON.parse(message.toString("utf-8"));
      console.log(parsedMessage);
      if (aSocket !== socket) aSocket.send(message.toString("utf-8"));
    });
  });

  socket.on("close", () => {
    console.log("Disconnected from Browser ❌");
  });
});
