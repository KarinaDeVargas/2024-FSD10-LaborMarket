import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import multer from "multer";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import messagesRoutes from "./routes/messages.js";
import chatController from "./controllers/chat.js";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Use cors middleware to enable CORS
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 8800;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
});

// Socket.IO integration
io.on("connection", (socket) => {
  console.log("A user connected");
  io.emit("message", { test: "This is a test message to all clients" }); // Test emit to all

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Handle incoming chat messages
  socket.on("chatMessage", async ({ senderId, receiverId, message }) => {
    await chatController.saveAndSendMessage(io, senderId, receiverId, message);

  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Include your routes here
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/messages", messagesRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
