const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const nickname = prompt("Hey, what's your nickname?");

socket.emit("nickname", nickname);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

socket.on("chat message", (msg, options = { welcomeMessage: false }) => {
  const message = document.createElement("li");
  message.textContent = options.welcomeMessage ? msg : `${nickname}: ${msg}`;
  messages.append(message);
  window.scrollBy(0, document.body.scrollHeight);
});
