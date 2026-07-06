const jwt = require('jsonwebtoken');
const Admin = require("../Model/User");

const authMiddleware = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

    // Attach decoded payload
    req.user = await Admin.findById(decoded.id).select("-password");
console.log("Decoded user:", decoded);
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;



