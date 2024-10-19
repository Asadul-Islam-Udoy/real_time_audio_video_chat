const express = require("express");
const socketIo = require("socket.io");
const colors = require("colors");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const path = require("path");
const server = require("http").Server(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React app URL
    methods: ["GET", "POST"],
  },
});
dotenv.config({ path: ".env" });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("callUser", ({ userToCall, signalData }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from: socket.id });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
  // Handle call ending
  socket.on("endCall", (roomId) => {
    // Notify all users in the room that the call has ended
    io.to(roomId).emit("callEnded");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello</h1>");
});
PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`server running successfully http://localhost:${PORT}`.bgBlue);
});
