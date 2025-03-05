import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    assignee: "",
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for initial tasks
    socket.on("loadTasks", (loadedTasks) => {
      setTasks(loadedTasks);
    });

    // Listen for task updates
    socket.on("taskUpdated", (updatedTasks) => {
      setTasks(updatedTasks);
    });

    // Listen for notifications
    socket.on("userNotified", (message) => {
      setNotifications((prev) => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTask = () => {
    if (newTask.title.trim() && newTask.assignee.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        status: "To Do", // Default status
      };
      socket.emit("addTask", task);
      setNewTask({
        title: "",
        description: "",
        deadline: "",
        assignee: "",
      });
    }
  };

  const deleteTask = (id) => {
    socket.emit("deleteTask", id);
  };

  const updateTaskStatus = (id, status) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status } : task
    );
    socket.emit("updateTask", updatedTasks);
  };

  return (
    <div>
      <h1>Task Dashboard (Real-time)</h1>

      {/* Task Creation Form */}
      <div>
        <h2>Create New Task</h2>
        <input
          type="text"
          name="title"
          value={newTask.title}
          onChange={handleInputChange}
          placeholder="Task Title"
        />
        <textarea
          name="description"
          value={newTask.description}
          onChange={handleInputChange}
          placeholder="Task Description"
        />
        <input
          type="date"
          name="deadline"
          value={newTask.deadline}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="assignee"
          value={newTask.assignee}
          onChange={handleInputChange}
          placeholder="Assignee"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Task List */}
      <div>
        <h2>Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>
                <strong>Deadline:</strong> {task.deadline}
              </p>
              <p>
                <strong>Assignee:</strong> {task.assignee}
              </p>
              <p>
                <strong>Status:</strong> {task.status}
              </p>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </li>
          ))}
        </ul>
      </div>

      {/* Notifications */}
      <div>
        <h2>Notifications</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskDashboard;
