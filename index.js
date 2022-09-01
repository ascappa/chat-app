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
  console.log("connected")
  const messages = await Message.find({});
  messages.forEach((msg) => {
    socket.emit("load message", { msg: msg.content, presenceChange: true })
  }
  )
  socket.on("nickname", async (nickname) => {
    console.log("nickname received")
    const welcomeMsg = `${nickname} joined the chat 😁`;
    const goodbyeMsg = `${nickname} left the chat 🥶`;
    io.emit("chat message", {
      msg: welcomeMsg,
      nickname,
      presenceChange: true,
    });
    await Message.create({content: welcomeMsg})

    socket.on("disconnect", async () => {
      io.emit("chat message", {
        msg: goodbyeMsg,
        nickname,
        presenceChange: true,
      });
      await Message.create({content: goodbyeMsg})
    });
  });
  socket.emit("send nickname")
  socket.on("save message", async (content) => {
    await Message.create({content})
  })
  socket.on("chat message", ({ msg, nickname }) => {
    io.emit("chat message", { msg, nickname });
  });
  socket.on("test", (test) => console.log(test))
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
