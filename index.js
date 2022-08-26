const express = require("express");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("nickname", (nickname) => {
    io.emit("chat message", `${nickname} joined the chat 😁`, nickname, {
      welcomeMessage: true,
    });
    socket.on("disconnect", () => {
      io.emit("chat message", `${nickname} left the chat 🥶`, nickname, {
        welcomeMessage: true,
      });
    });
  });
  socket.on("chat message", (msg, nickname) => {
    io.emit("chat message", msg, nickname);
  });
});

server.listen(PORT, () => console.log("listening"));
