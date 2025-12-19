const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

const extractToken = (req) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return { success: false, message: "Authorization token missing" };

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return { success: true, message: "Token extracted successfully.", Token: decoded };
  }
  catch (ex) {
    return { success: false, message: "Token is Invalid." };
  }
}

module.exports = { generateToken, extractToken };
