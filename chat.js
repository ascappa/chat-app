const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

socket.on("load message", ({ msg, nickname, presenceChange = false }) => {
  const message = document.createElement("li");
  message.textContent = presenceChange ? msg : `${nickname}: ${msg}`;
  messages.append(message);
  messages.scrollTo(0, messages.scrollHeight);
});
if (!localStorage.getItem("nickname")) {
  localStorage.setItem("nickname", prompt("Hey, what's your nickname?"));
}
const nickname = localStorage.getItem("nickname");
socket.on("connect", () => {
  console.log("is" + socket.connected)
  socket.emit("nickname", nickname)
})

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const msg = input.value;
    socket.emit("chat message", { msg, nickname });
    socket.emit("save message", `${nickname}: ${msg}`);
    input.value = "";
  }
});

socket.on("chat message", async ({ msg, nickname, presenceChange = false }) => {
  const message = document.createElement("li");
  console.log(presenceChange);
  message.textContent = presenceChange ? msg : `${nickname}: ${msg}`;
  messages.append(message);
  messages.scrollBy(0, messages.scrollHeight);
});
