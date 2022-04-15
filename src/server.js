import express from "express";
import http from "http";
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
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
const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

server.listen(PORT, handleListen);

io.on("connection", (socket) => {
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });

  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer',offer);
  })
});
