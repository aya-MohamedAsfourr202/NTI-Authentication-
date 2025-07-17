const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res
        .status(403)
        .json({ message: "User role not found in request" });
    }

    if (!allowedRoles.includes(req.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
};

module.exports = {
  auth,
  restrictTo,
};
