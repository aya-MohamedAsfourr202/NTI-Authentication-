/*
router.get("/todos", controller.getAllTodos);
router.get("/todos/:id", controller.getTodoById);
router.post("/todos", controller.createTodo);
router.patch("/todos/:id", controller.updateTodo);
router.delete("/todos/:id", controller.deleteTodo);
router.get("/todos/user/:userId", controller.getTodoByUserId);

module.exports = router;
 */
const express = require("express");
const router = express.Router();
const { auth, restrictTo } = require("../middlewares/auth.middleware");
const todoController = require("../Controllers/todos.controller");

router.post("/todos", auth, restrictTo("user"), todoController.createTodo);

router.delete(
  "/todos/:id",
  auth,
  restrictTo("admin"),
  todoController.deleteTodo
);
router.get("/todos", auth, todoController.getAllTodos);
router.patch("/todos/:id", auth, restrictTo("user"), todoController.updateTodo);

module.exports = router;
