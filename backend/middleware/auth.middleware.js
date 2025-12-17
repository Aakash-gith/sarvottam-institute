import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/Users.js"; // Added User import

dotenv.config();

// Auth Middleware (Updated)
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    // console.log("AuthMiddleware Token:", token ? "Present" : "Missing");

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Support id, userId, and _id (from admin controller)
    const userIdToFind = decoded.id || decoded.userId || decoded._id;
    req.user = await User.findById(userIdToFind).select("-password -securityAnswer");

    if (!req.user) {
      console.log("AuthMiddleware: User not found in DB");
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.token = token;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
