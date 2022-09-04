/* This is the code that is used to setup the server. */
const express = require("express");
const http = require("http");
const { default: mongoose } = require("mongoose");
/* Creating an HTTP server and passing the express app to it. */
const app = express();
const server = http.createServer(app);
/* Socket.io takes an instance of an HTTP server that it upgrades to a websocket server. */
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const Message = require("./models/Message.js");
const dotenv = require("dotenv");
dotenv.config();
// setup middleware for static files
app.use(express.static(__dirname));
// route for main page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// socket.io connection handler
io.on("connection", async (socket) => {
  console.log("connected");
  /* Getting the last 25 messages from the database. */
  let messages = await Message.find({});
  messages = messages.slice(-25);

  /* A function that is called when the client sends a nickname. It is used to send the last 25
  messages to the client and to send a message to all clients when a client joins or leaves the
  chat. */
  socket.on("nickname", async (nickname) => {
    console.log("nickname received");
    /* Sending the last 25 messages to the client. */
    messages.forEach((message) => {
      const { content, nickname, presenceChange } = message;
      socket.emit("chat message", { content, nickname, presenceChange });
    });
    /* Sending a message to all clients when a client joins the chat and saving it to database. */
    const welcomeMsg = ` joined the chat 😁`;
    const goodbyeMsg = ` left the chat 🥶`;
    io.emit("chat message", {
      content: welcomeMsg,
      nickname,
      presenceChange: true,
    });
    await Message.create({
      content: welcomeMsg,
      nickname,
      presenceChange: true,
    });

    /* Sending a message to all clients when a client leaves the chat and saving it to database. */
    socket.on("disconnect", async () => {
      io.emit("chat message", {
        content: goodbyeMsg,
        nickname,
        presenceChange: true,
      });
      await Message.create({
        content: goodbyeMsg,
        nickname,
        presenceChange: true,
      });
    });
  });

  /* Telling the client to send the nickname. */
  socket.emit("send nickname");

  /* A function that is called when the client wants to save a message to the database. */
  socket.on("save message", async ({ content, nickname }) => {
    await Message.create({ content, nickname });
  });

  /* A function that is called when the client sends a message. It is used to send the message to all
  clients. */
  socket.on("chat message", ({ content, nickname }) => {
    io.emit("chat message", { content, nickname });
  });
});

/**
 * If the connection to the database is successful, then start the server.
 */
async function run() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    server.listen(PORT, () => console.log("listening"));
  } catch (err) {
    console.log(err);
  }
}
run();
