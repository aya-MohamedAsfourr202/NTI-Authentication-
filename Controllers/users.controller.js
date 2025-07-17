/* const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Post
exports.registerUser = async (req, res) => {
  try {
    const { username, password, firstName, lastName, dob } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      dob,
    });

    await newUser.save();
    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    res.status(400).json({ message: "Error", error });
  }
};

// Get All
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get User By ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Patch
exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User was edited successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ message: "Error updating user", error });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
 */

const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const user = await User.create({ name, username, email, password, role });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res
      .status(201)
      .json({ message: "User registered", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Missing username or password" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};

// Refresh Token
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting users", error: error.message });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting user", error: error.message });
  }
};

// Update user (admin only)
exports.editUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res
      .status(200)
      .json({ message: "User updated", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
