import express from "express";
const router = express.Router();
import * as paymentController from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"; // Correct path based on file structure

// Protected Routes
router.post("/create-order", authMiddleware, paymentController.createOrder);
router.post("/verify-payment", authMiddleware, paymentController.verifyPayment);
router.get("/get-key", authMiddleware, paymentController.getRazorpayKey);

export default router;
