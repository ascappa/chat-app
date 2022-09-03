const socket = io();

// fix for mobile viewport
// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty("--vh", `${vh}px`);

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

window.addEventListener("resize", (e) => {
  vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on("load message", ({ msg, nickname, presenceChange = false }) => {
  const message = document.createElement("li");
  message.textContent = presenceChange ? msg : `${nickname}: ${msg}`;
  messages.append(message);
  messages.scrollTo(0, messages.scrollHeight);
});
let nickname;
socket.on("send nickname", () => {
  if (!localStorage.getItem("nickname")) {
    localStorage.setItem("nickname", prompt("Hey, what's your nickname?"));
  }
  nickname = localStorage.getItem("nickname");
  socket.emit("nickname", nickname);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const msg = input.value;
    socket.emit("chat message", { msg, nickname });
    socket.emit("save message", `${nickname}: ${msg}`);
    input.value = "";
  }
});

socket.on(
  "chat message",
  async ({ msg, nickname, presenceChange = false, own = false }) => {
    const message = document.createElement("li");
    console.log(presenceChange);
    if (own) {
      message.textContent = `You: ${msg}`;
      message.className = "own";
    } else {
      message.textContent = presenceChange ? msg : `${nickname}: ${msg}`;
    }
    messages.append(message);
    messages.scrollBy(0, messages.scrollHeight);
  }
);
