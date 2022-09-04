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
    const content = input.value;
    socket.emit("chat message", { content, nickname });
    socket.emit("save message", { content, nickname });
    input.value = "";
  }
});

socket.on(
  "chat message",
  async ({ content, nickname: messageNickname, presenceChange = false }) => {
    const message = document.createElement("li");
    console.log(presenceChange);
    if (nickname === messageNickname) {
      displayedNickname = "You";
      message.className = "own-message"
    } else {
      displayedNickname = messageNickname;
    }
    if (presenceChange) {
      message.className = "presence-message"
    }
    message.textContent = presenceChange
      ? `${displayedNickname} ${content}`
      : `${displayedNickname}: ${content}`;
    messages.append(message);
    messages.scrollBy(0, messages.scrollHeight);
  }
);
