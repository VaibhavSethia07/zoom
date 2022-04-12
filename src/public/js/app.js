const socket = io();
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const roomForm = welcome.querySelector("#roomname");
const nicknameForm = welcome.querySelector("#nickname");

room.hidden = true;
let roomName = "";

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
};

const handleNicknameSubmit = (event) => {
  event.preventDefault();

  const input = welcome.querySelector("#nickname input");
  const value = input.value;
  socket.emit("set_nickname", value);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();

  // We first access the message form and then input
  const input = room.querySelector("#message input");
  const message = input.value;
  socket.emit("new_message", message, roomName, () => {
    addMessage(`You: ${message}`);
  });
  input.value = "";
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgform = room.querySelector("#message");
  msgform.addEventListener("submit", handleMessageSubmit);
};

roomForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = roomForm.querySelector("input");
  roomName = input.value;
  socket.emit("enter_room", input.value, showRoom);
  input.value = "";
});

nicknameForm.addEventListener("submit", handleNicknameSubmit);

socket.on("welcome", (message) => {
  addMessage(message);
});

socket.on("bye", (message) => {
  addMessage(message);
});

socket.on("new_message", (message) => {
  addMessage(message);
});

socket.on("rooms_created", (rooms) => {
  const roomsList = welcome.querySelector("ul");
  // Always empty the previous list to avoid appending to same list
  roomsList.innerHTML = "";

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomsList.append(li);
  });
});
