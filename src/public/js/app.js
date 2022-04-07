const socket = new WebSocket(`ws://${window.location.host}`);

// Listening from server
socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

// Sending message from browser. We don't send the message immediately.
setTimeout(() => {
  socket.send("Hello from the browser!");
}, 10000);
