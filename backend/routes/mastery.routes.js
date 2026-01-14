import express from "express";
import * as masteryController from "../controllers/mastery.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes or routes that handle their own auth
router.use(authMiddleware);

// Generate cards using AI
router.post("/generate", masteryController.generateMasteryCards);

// Create a new set
router.post("/create", masteryController.createMasterySet);

// Get all sets
router.get("/sets", masteryController.getMasterySets);

// Get single set
router.get("/set/:id", masteryController.getMasterySetById);

// Update progress
router.post("/set/:setId/status", masteryController.updateCardStatus);
router.post("/set/:setId/match", masteryController.updateMatchTime);

// Delete a set
router.delete("/set/:id", masteryController.deleteMasterySet);

export default router;
