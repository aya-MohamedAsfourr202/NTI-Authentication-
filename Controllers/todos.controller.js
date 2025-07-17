const mongoose = require("mongoose");
const Todo = require("../models/todo.model");

//  Get All Todos
exports.getAllTodos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const todos = await Todo.find()
      .limit(limit)
      .skip(skip)
      .populate({
        path: "userId",
        select: "username email -_id",
      })
      .select("title status ");

    res.status(200).json({ status: "success", todos });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching todos", error: err.message });
  }
};

//  Get Todo by ID
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate("userId", "username email")
      .select("title status ");

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({ status: "success", todo });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get Todos by User ID
exports.getTodoByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const todos = await Todo.find({ userId })
      .populate("userId", "username email ")
      .select("title status ");

    if (todos.length === 0) {
      return res.status(404).json({ message: "No todos found for this user" });
    }

    res.status(200).json({ status: "success", todos });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// post
exports.createTodo = async (req, res) => {
  try {
    const { title, status = "to-do", userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: "Title and userId are required" });
    }

    if (title.length < 5 || title.length > 20) {
      return res.status(400).json({ message: "Title must be 5-20 characters" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const newTodo = new Todo({ title, status, userId });
    await newTodo.save();

    res.status(201).json({ message: "Todo created", data: newTodo });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating todo", error: err.message });
  }
};

// Update Todo
exports.updateTodo = async (req, res) => {
  try {
    const { title, status } = req.body;

    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (title) {
      if (title.length < 5 || title.length > 20) {
        return res
          .status(400)
          .json({ message: "Title must be 5-20 characters" });
      }
      todo.title = title;
    }

    if (status && ["to-do", "in progress", "done"].includes(status)) {
      todo.status = status;
    }

    await todo.save();
    res.json({ message: "Todo updated", data: todo });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating todo", error: err.message });
  }
};

// Delete Todo
exports.deleteTodo = async (req, res) => {
  try {
    const deleted = await Todo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Todo not found" });

    res.json({ message: "Todo deleted", data: deleted });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting todo", error: err.message });
  }
};
