const express = require("express");
const http = require("http");
const { default: mongoose } = require("mongoose");
const app = express();
const { Server } = require("socket.io");
const server = http.createServer(app);
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
  let messages = await Message.find({});
  messages = messages.slice(-25);

  socket.on("nickname", async (nickname) => {
    console.log("nickname received");
    messages.forEach((message) => {
      const { content, nickname, presenceChange } = message;
      socket.emit("chat message", { content, nickname, presenceChange });
    });
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

  socket.emit("send nickname");

  socket.on("save message", async ({ content, nickname }) => {
    await Message.create({ content, nickname });
  });

  socket.on("chat message", ({ content, nickname }) => {
    io.emit("chat message", { content, nickname });
  });

  socket.on("test", (test) => console.log(test));
});

async function run() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    server.listen(PORT, () => console.log("listening"));
  } catch (err) {
    console.log(err);
  }
}
run();
