const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName = "";

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
};

const addWelcomeNote = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.append(li);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = form.querySelector("input");
  roomName = input.value;
  socket.emit("enter_room", input.value, showRoom);
  input.value = "";
});

socket.on("welcome", (message) => {
  addWelcomeNote(message);
});
