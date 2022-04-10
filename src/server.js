import express from "express";
import http from "http";
import SocketIO from "socket.io";
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
const io = SocketIO(server);

io.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Event: ${event}`);
  });

  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName);
    showRoom();

    socket.to(roomName).emit("welcome", `Someone has joined the room!`);
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });

  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", message);
    done();
  });
});

// const sockets = [];
// wss.on("connection", (socket) => {
//   socket["nickname"] = "anonymous";
//   console.log("Connected to Browser ✅");
//   sockets.push(socket);

//   socket.on("message", (message) => {
//     const parsedMessage = JSON.parse(message.toString("utf-8"));
//     switch (parsedMessage.type) {
//       case "new_message":
//         sockets.forEach((aSocket) => {
//           if (aSocket !== socket)
//             aSocket.send(
//               `${socket.nickname}: ${parsedMessage.payload.toString("utf-8")}`
//             );
//         });
//         break;
//       case "nickname":
//         socket["nickname"] = parsedMessage.payload;
//         break;
//     }
//   });

//   socket.on("close", () => {
//     console.log("Disconnected from Browser ❌");
//   });
// });

server.listen(PORT, handleListen);
