const socket = io();
const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
socket.on("load message", ({ msg, nickname, presenceChange = false }) => {
  const message = document.createElement("li");
  message.textContent = presenceChange ? msg : `${nickname}: ${msg}`;
  messages.append(message);
  window.scrollBy(0, document.body.scrollHeight);
})
const nickname = prompt("Hey, what's your nickname?");

socket.emit("nickname", nickname);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", { msg: input.value, nickname });
    input.value = "";
  }
});

socket.on("chat message", async ({ msg, nickname, presenceChange = false }) => {
  const message = document.createElement("li");
  console.log(presenceChange);
  message.textContent = presenceChange ? msg : `${nickname}: ${msg}`;
  socket.emit("save message", message.textContent)
  messages.append(message);
  window.scrollBy(0, document.body.scrollHeight);
});