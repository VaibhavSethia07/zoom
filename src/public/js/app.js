const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName = "";

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();

  const input = room.querySelector("input");
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

  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = form.querySelector("input");
  roomName = input.value;
  socket.emit("enter_room", input.value, showRoom);
  input.value = "";
});

socket.on("welcome", (message) => {
  addMessage(message);
});

socket.on("bye", () => {
  addMessage("Someone left the room:(");
});

socket.on("new_message", (message) => {
  addMessage(message);
});
