const express = require("express");
const http = require("http");
const socket = require("socket.io");
const path = require("path");

const app = express();

//setting up view engine
app.set("view engine", "ejs");

//routes
app.get("/", (req, res) => {
  //res.sendFile(path.join(__dirname, "../public/index.html"));
  res.render("index");
});

// app.get("/submit", (req, res) => {

// })
const httpServer = http.createServer(app);

httpServer.listen(3000, (error) => {
  if (error) {
    console.log("something went wrong", error);
  } else {
    console.log("listening on port 3000");
  }
});

//socket initialization
const io = socket(httpServer);

//keep track of all connected users

io.on("connection", async (socket) => {
  console.log("made socket connection");
  const users = [];
  //send all connected users on the client

  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  console.log(users);
  io.sockets.emit("users", users);

  //listen for message emit
  socket.on("message", (arg) => {
    const message = {
      username: socket.username,
      message: arg,
    };
    io.sockets.emit("message", message);
  });
});

//io middlewares
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});
