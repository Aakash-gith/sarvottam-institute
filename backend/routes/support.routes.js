import express from "express";
import {
    createTicket,
    getMyTickets,
    getAllTicketsAdmin,
    updateTicketStatus,
    assignTicket,
    addMessage,
    addInternalNote,
    getTicketDetails
} from "../controllers/support.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// User routes
router.post("/tickets", authMiddleware, createTicket);
router.get("/my-tickets", authMiddleware, getMyTickets);
router.get("/tickets/:id", authMiddleware, getTicketDetails);
router.post("/tickets/:id/message", authMiddleware, addMessage);

// Admin routes
router.get("/admin/all", authMiddleware, adminMiddleware, getAllTicketsAdmin);
router.put("/admin/tickets/:id/status", authMiddleware, adminMiddleware, updateTicketStatus);
router.put("/admin/tickets/:id/assign", authMiddleware, adminMiddleware, assignTicket);
router.post("/admin/tickets/:id/internal-note", authMiddleware, adminMiddleware, addInternalNote);

export default router;
