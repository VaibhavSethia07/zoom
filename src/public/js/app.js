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

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = form.querySelector("input");
  // User defined event, any type of data and a function to be executed by server on browser
  roomName = input.value;
  socket.emit("enter_room", input.value, showRoom);
  input.value = "";
});
