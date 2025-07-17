const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3333;
require("dotenv").config();

app.use(express.json());

// Import routes
const userRoutes = require("./Routes/users.routes");
const todoRoutes = require("./Routes/todos.routes");

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Use routes directly (without /api prefix)

app.use("/api", userRoutes); // ده يخلي /api/login يشتغل

app.use("/api", todoRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/Test")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.log("MongoDB connection error", err);
  });
