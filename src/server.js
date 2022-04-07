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

server.listen(PORT, handleListen);

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  socket.send("Hello!");

  // Receives the message after the timeout send
  socket.on("message", (message) => {
    console.log("New message: ", message.toString("utf8"), "from Browser");
  });
  // Listening from browser. To see this in action, close the browser
  socket.on("close", () => {
    console.log("Disconnected from Browser ❌");
  });
});
