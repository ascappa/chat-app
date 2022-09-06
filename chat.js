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
    socket.emit("save message", { content, nickname });
    socket.emit("chat message", { content, nickname, createdAt: Date.now() });
    input.value = "";
  }
});

/* This function creates the message element for the client and checks what kind of message (generic,
  presence, own, etc.) it is. */
socket.on(
  "chat message",
  async ({
    content,
    nickname: messageNickname,
    presenceChange = false,
    createdAt,
  }) => {
    /* Get date from database */
    const date = new Date(createdAt);
    console.log(typeof createdAt);
    /* We created the elements that could be used by the different types of messages */
    const message = document.createElement("li");
    const nicknameBlock = document.createElement("div");
    const contentBlock = document.createElement("div");
    const dateBlock = document.createElement("div");
    const displayedNickname =
      nickname === messageNickname ? "You" : messageNickname;
    console.log(presenceChange);
    /* We display a joined/left message if the presence changed */
    if (presenceChange) {
      message.className = "presence-message";
      message.textContent = `${displayedNickname} ${content}`;
    } else {
      /* Otherwise, we make a generic or own message depending on the nickname of the message */
      if (displayedNickname === "You") {
        message.className = "own-message";
      }
      nicknameBlock.className = "nickname";
      contentBlock.className = "content";
      dateBlock.className = "date";
      nicknameBlock.textContent = displayedNickname;
      contentBlock.textContent = content;
      /* We get the appropriate time string depending on the language (or location?) settings of the user*/ 
      dateBlock.textContent = date.toLocaleTimeString(undefined, {
        timeStyle: "short",
      });
      message.append(nicknameBlock, contentBlock, dateBlock);
    }
    messages.append(message);
    messages.scrollBy(0, messages.scrollHeight);
  }
);
