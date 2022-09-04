const socket = io();

// fix for mobile viewport
// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty("--vh", `${vh}px`);

/* Getting the elements from the HTML file. */
const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

/* A function that is called when the window is resized. It is used to make the chat responsive. */
window.addEventListener("resize", (e) => {
  vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  messages.scrollTo(0, messages.scrollHeight);
});

/* Asking the user for a nickname and then storing it in local storage. */
let nickname;
socket.on("send nickname", () => {
  if (!localStorage.getItem("nickname")) {
    localStorage.setItem("nickname", prompt("Hey, what's your nickname?"));
  }
  nickname = localStorage.getItem("nickname");
  socket.emit("nickname", nickname);
});

/* Listening for a submit event on the form element. When the event is triggered, it prevents the
default action of the event, which is to reload the page. Then it tells the server to send
a message to all clients and save it to the database and then it resets the input. */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const content = input.value;
    socket.emit("chat message", { content, nickname });
    socket.emit("save message", { content, nickname });
    input.value = "";
  }
});

/* This function creates the message element for the client and checks what kind of message (generic,
  presence, own, etc.) it is. */
socket.on(
  "chat message",
  async ({ content, nickname: messageNickname, presenceChange = false }) => {
    const message = document.createElement("li");
    console.log(presenceChange);
    if (nickname === messageNickname) {
      displayedNickname = "You";
      message.className = "own-message";
    } else {
      displayedNickname = messageNickname;
    }
    if (presenceChange) {
      message.className = "presence-message";
    }
    message.textContent = presenceChange
      ? `${displayedNickname} ${content}`
      : `${displayedNickname}: ${content}`;
    messages.append(message);
    messages.scrollBy(0, messages.scrollHeight);
  }
);
