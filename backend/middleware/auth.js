const jwt = require("jsonwebtoken");
const pool = require("../db/connection");

const sendAuthError = (res, message = "Unauthorized") => {
  return res.status(401).json({ success: false, error: message });
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return sendAuthError(res, "Missing authorization token");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, role, is_active FROM counsellors WHERE id = ? LIMIT 1",
      [payload.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return sendAuthError(res, "User account is inactive or missing");
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendAuthError(res, "Token expired");
    }
    return sendAuthError(res, "Invalid authorization token");
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !["admin", "centre_head"].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
