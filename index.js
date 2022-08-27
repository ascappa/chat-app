const express = require("express");
const http = require("http");
const { default: mongoose } = require("mongoose");
const app = express();
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const Message = require("./models/Message.js");
const dotenv = require("dotenv")
dotenv.config()

app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", async (socket) => {
  const messages = await Message.find({});
  messages.forEach((msg) => {
    socket.emit("load message", { msg: msg.content, presenceChange: true })
  }
  );
  socket.on("nickname", (nickname) => {
    const welcomeMsg = `${nickname} joined the chat 😁`;
    const goodbyeMsg = `${nickname} left the chat 🥶`;

    io.emit("chat message", {
      msg: welcomeMsg,
      nickname,
      presenceChange: true,
    });

    socket.on("disconnect", () => {
      io.emit("chat message", {
        msg: goodbyeMsg,
        nickname,
        presenceChange: true,
      });
    });
  });
  socket.on("save message", async (content) => {
    await Message.create({content})
  })
  socket.on("chat message", ({ msg, nickname }) => {
    io.emit("chat message", { msg, nickname });
  });
});

async function run() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    server.listen(PORT, () => console.log("listening"));
  } catch (err) {
    console.log(err);
  }
}
run()
