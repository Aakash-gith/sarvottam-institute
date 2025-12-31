import { Router } from "express";
import {
    requestAdminAccess,
    getAdminRequestStatus,
    getPendingRequests,
    approveAdminRequest,
    rejectAdminRequest,
    getAdminInfo,
    adminLoginNew,
    sendLoginOTP,
    verifyLoginOTP,
    forgotPasswordSendOTP,
    verifyOTPAndResetPassword,
    getAllUsers,
    getUserAnalytics,
    getDashboardStats,
    getAllAdmins, // Added
    updateAdminPermissions, // Added
    toggleAdminAccess, // Added
    sendNotification, // Added
    lockUser, // Added
    resetUserPassword, // Added
} from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminMiddleware, masterAdminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();
router.use((req, res, next) => {
    console.log(`[ADMIN ROUTER] ${req.path}`);
    next();
});
console.log("Admin Routes Loaded");

// Public routes
router.post("/send-notification", sendNotification);
router.post("/request-access", requestAdminAccess);
router.get("/request-status", getAdminRequestStatus);
router.post("/login", adminLoginNew);
router.post("/login/send-otp", sendLoginOTP);
router.post("/login/verify-otp", verifyLoginOTP);
router.post("/forgot-password/send-otp", forgotPasswordSendOTP);
router.post("/forgot-password/verify-otp", verifyOTPAndResetPassword);

// Protected routes
router.get("/info", authMiddleware, adminMiddleware, getAdminInfo);
router.get("/dashboard-stats", authMiddleware, adminMiddleware, getDashboardStats); // Added
router.get("/pending-requests", authMiddleware, masterAdminMiddleware, getPendingRequests);
router.put("/approve/:requestId", authMiddleware, masterAdminMiddleware, approveAdminRequest);
router.put("/reject/:requestId", authMiddleware, masterAdminMiddleware, rejectAdminRequest);

// User Analytics Routes (Admin only)
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/users/:userId/analytics", authMiddleware, adminMiddleware, getUserAnalytics);

// User Management (Master Admin Only)
router.put("/users/:userId/lock", authMiddleware, masterAdminMiddleware, lockUser);
router.put("/users/:userId/reset-password", authMiddleware, masterAdminMiddleware, resetUserPassword);

// Admin Management Routes
router.get("/list", authMiddleware, adminMiddleware, getAllAdmins);
router.put("/:adminId/permissions", authMiddleware, masterAdminMiddleware, updateAdminPermissions);
router.put("/:adminId/access", authMiddleware, masterAdminMiddleware, toggleAdminAccess);


export default router;
