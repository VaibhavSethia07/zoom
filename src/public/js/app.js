const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const done = () => {
  console.log("This function is executed by server in browser");
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = form.querySelector("input");
  // User defined event, any type of data and a function to be executed by server on browser
  socket.emit("room", { payload: input.value }, done);
  input.value = "";
});
