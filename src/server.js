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

const getPublicRooms = () => {
  const sids = io.sockets.adapter.sids;
  const rooms = io.sockets.adapter.rooms;
  let publicRooms = [];

  rooms.forEach((value, key) => {
    if (sids.get(key) === undefined) publicRooms.push(key);
  });
  return publicRooms;
};

const getRoomSize = (roomName) => {
  // We put ? to handle the case if roomName is not given
  return io.sockets.adapter.rooms.get(roomName)?.size;
};

io.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    console.log(`Event: ${event}`);
  });
  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName);
    showRoom();
    io.sockets.emit("rooms_created", getPublicRooms());
    socket
      .to(roomName)
      .emit(
        "welcome",
        `${socket.nickname} has joined the room!`,
        getRoomSize(roomName)
      );
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomName) =>
      socket
        .to(roomName)
        .emit(
          "bye",
          `${socket.nickname} left the room:(`,
          getRoomSize(roomName) - 1
        )
    );
  });

  socket.on("disconnect", () => {
    io.sockets.emit("rooms_created", getPublicRooms());
  });

  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
    done();
  });

  socket.on("set_nickname", (nickname) => {
    socket["nickname"] = nickname;
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
