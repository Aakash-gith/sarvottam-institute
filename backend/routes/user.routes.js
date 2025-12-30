import express from "express";
import * as userController from "../controllers/user.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search users
router.get("/search", userController.searchUsers);

// Get user profile stats
router.get("/profile-stats", userController.getProfileStats);

// Update user name
router.put("/update-name", userController.updateName);

// Update user semester
router.put("/update-semester", userController.updateSemester);

// Update user class
router.put("/update-class", userController.updateClass);

// Profile picture routes
router.get("/profile-picture", userController.getProfilePicture);
router.post("/upload-profile-picture", upload.single("profilePicture"), userController.uploadProfilePicture);
router.delete("/remove-profile-picture", userController.removeProfilePicture);

// Notification Routes
router.get("/notifications", userController.getNotifications);
router.put("/notifications/:notificationId/read", userController.markNotificationRead);

export default router;
