/* const express = require("express");
const router = express.Router();

const controller = require("../Controllers/users.controller");

router.post("/users", controller.registerUser);
router.get("/users", controller.getUsers);
router.get("/users/:id", controller.getUserById);
router.patch("/users/:id", controller.editUser);
router.delete("/users/:id", controller.deleteUser);

module.exports = router;
 */
const express = require("express");
const router = express.Router();
const userController = require("../Controllers/users.controller");
const { auth, restrictTo } = require("../middlewares/auth.middleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.get("/", auth, restrictTo("admin"), userController.getUsers);
router.delete("/:id", auth, restrictTo("admin"), userController.deleteUser);
router.patch("/:id", auth, restrictTo("admin"), userController.editUser);

module.exports = router;
