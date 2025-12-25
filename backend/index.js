import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./conf/database.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import taskRoutes from "./routes/task.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authMiddleware from "./middleware/auth.middleware.js";
import progressRoutes from "./routes/progress.routes.js";
import subjectNotesRoutes from "./routes/subjectsNotes.routes.js";
import pyqRoutes from "./routes/pyq.routes.js";
import messageRoutes from "./routes/message.routes.js";
import courseRoutes from "./routes/course.routes.js";
import liveClassRoutes from "./routes/liveClass.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Create uploads directory for profile pictures
const uploadsDir = path.join(__dirname, "uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Core Middleware
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// CORS configuration - accept localhost on any port for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    // Check for production origin from env
    const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
    if (origin === CORS_ORIGIN) {
      return callback(null, true);
    }

    // Allow if origins match
    callback(null, true); // Allow all origins for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route - API status
app.get("/", (req, res) => {
  res.json({
    status: "✅ Sarvottam Institute Backend is Live!",
    message: "API is running successfully",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
console.log("Mounting /api/admin routes...");
app.use("/api/admin", adminRoutes);
app.use("/api/event", authMiddleware, eventRoutes);
app.use("/api/task", authMiddleware, taskRoutes);
app.use("/api/quiz", authMiddleware, quizRoutes);
app.use("/api/user", userRoutes);
app.use("/api/progress", authMiddleware, progressRoutes);
app.use("/api/subjectNotes", subjectNotesRoutes);
app.use("/api/pyq", pyqRoutes);

console.log("Mounting /api/message routes...");
app.use("/api/message", messageRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/live-classes", liveClassRoutes);
import paymentRoutes from "./routes/payment.routes.js";
app.use("/api/payment", paymentRoutes);
import uploadRoutes from "./routes/upload.routes.js";
app.use("/api/upload", uploadRoutes);

const grade10Path = path.join(__dirname, "../grade10");
const grade9Path = path.join(__dirname, "../grade9");

app.use("/grade10", express.static(grade10Path));
app.use("/grade9", express.static(grade9Path));

const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Direct debug route
app.post("/api/admin/send-notification", (req, res) => {
  console.log("Direct route /api/admin/send-notification HIT!");
  res.status(200).json({ success: true, message: "Direct route works!" });
});

// 404 Fallback
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
