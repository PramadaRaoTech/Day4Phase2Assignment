const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (for development)
  },
});

app.use(cors());
app.use(express.json());

// In-memory task storage
let tasks = [];

// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send initial tasks to the connected client
  socket.emit("loadTasks", tasks);

  // Handle adding a task
  socket.on("addTask", (task) => {
    tasks.push(task);
    io.emit("taskUpdated", tasks); // Broadcast updated tasks to all clients
    io.emit("userNotified", `New task added: ${task.title}`); // Notify all users
  });

  // Handle deleting a task
  socket.on("deleteTask", (taskId) => {
    const deletedTask = tasks.find((task) => task.id === taskId);
    tasks = tasks.filter((task) => task.id !== taskId);
    io.emit("taskUpdated", tasks); // Broadcast updated tasks to all clients
    io.emit("userNotified", `Task deleted: ${deletedTask.title}`); // Notify all users
  });

  // Handle updating a task (e.g., status change)
  socket.on("updateTask", (updatedTasks) => {
    tasks = updatedTasks;
    io.emit("taskUpdated", tasks); // Broadcast updated tasks to all clients
    io.emit("userNotified", `Task status updated`); // Notify all users
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
