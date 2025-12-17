import AdminRequest from "../models/AdminRequest.js";
import AdminUser from "../models/AdminUser.js";
import User from "../models/Users.js";
import Notification from "../models/Notification.js"; // Added Import
import PasswordReset from "../models/PasswordReset.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Progress from "../models/Progress.js";
import SubjectNotes from "../models/SubjectNotes.js"; // Added SubjectNotes import if not already there (it wasn't in the view_file of top 800 lines? Wait, let me check view_file 1112)
import axios from "axios";
import { sendOtp, verifyMojoAuthToken } from "./helperFunctions.js";
import redis from "../conf/redis.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EmailJS Config
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

const otpEmailTemplate = (otp) => `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #2563eb;">Sarvottam Institute</h2>
  <p>Your Verification Code:</p>
  <h1 style="letter-spacing: 5px; font-size: 32px; color: #000;">${otp}</h1>
  <p>This code will expire in 5 minutes.</p>
</div>
`;

const MASTER_ADMIN_EMAIL = "arsir.personal@gmail.com";

// Send email notification (keeping the original helper for admin requests)
// Send email helper (Via EmailJS)
const sendEmail = async (to, subject, html) => {
    try {
        const data = {
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            accessToken: EMAILJS_PRIVATE_KEY,
            template_params: {
                to_email: to,
                otp: html, // NOTE: Assuming we create a generic template that takes 'otp' or 'message_html'. 
                // However, EmailJS templates are static. We need to pass the "message" or "otp".
                // Since the user has 'template_m8444qj' which is likely an OTP template, we should verify usage.
                // For 'AdminRequest', we are sending complex HTML. EmailJS free tier might struggle with custom HTML if the template expects 'otp'.
                // Strategy: Pass the entire HTML as a variable if the template allows, OR just rely on 'otp' var if that's what we have.
                // Current template `template_m8444qj` is likely just for OTP.
                // But for 'Subject' support, we need a flexible template.
                // Assuming 'template_m8444qj' has {{otp}} and {{to_email}}.
                // If we send admin notifications, we might need a different template or hack it.
                // Let's assume 'otp' variable can hold the message content for now.
                otp: html.replace(/<[^>]*>?/gm, ''), // Stripping HTML for safety if template is text-only, or sending raw if it supports HTML.
                // Wait, if the template is an OTP template, it will say "Your verification code is..."
                // Sending "Admin access approved" inside that will look weird.
                // Ideally, user needs a second "Generic" template.
                // But let's try to map 'otp' to the main content.
                // BETTER: Send raw text message for admin notifications if complex HTML isn't supported.
                app_name: "Sarvottam Institute"
            }
        };

        // If we are just sending OTP (most cases), 'html' is the OTP or contains it.
        // Let's look at how sendEmail is called.
        // 1. Admin Request: html is complex HTML.
        // 2. Approve Admin: html is complex HTML. 
        // 3. Login OTP: html IS the OTP template string (which is just the OTP code wrapped in divs).

        // CRITICAL FIX: The current 'otpEmailTemplate' implementation in THIS file returns HTML string with OTP.
        // EmailJS template expects {{otp}}.
        // We should pass just the content.

        // Logic: specific handling.
        // If subject includes "OTP", treat 'html' as containing the OTP code or just extract it?
        // Actually, 'helperFunctions.js' passes just the OTP code to 'template_params.otp'.
        // Here, 'sendEmail' receives (to, subject, html).
        // WE CANNOT EASILY SUPPORT GENERIC EMAILS with a single OTP template.
        // We will do our best by passing the subject as 'app_name' (maybe?) and the content as 'otp'.

        // RE-READING helperFunctions.js:
        // const sendOtpEmail = async (email, otp) => { ... template_params: { otp: otp } ... }

        // In admin.controller.js calls:
        // await sendEmail(email, "Subject", otpEmailTemplate(otp)); -> This passes HTML string.

        // We need to change the CALLERS to pass just the OTP if it's an OTP email.
        // But 'sendEmail' is also used for "Admin Request" notifications which are NOT OTPs.

        // PROBLEM: We have ONE template ID `template_m8444qj` which is designed for OTPs.
        // Sending generic admin notifications through it will look like "Your OTP is: <div>...</div>".
        // It's ugly but functional for now.

        // Let's just send the raw text/html into the 'otp' field and hope the template renders it.
        // Many EmailJS templates use {{{otp}}} for unescaped HTML. If it uses {{otp}}, it will escape it.

        console.log(`[EmailJS] Sending email to ${to}...`);
        const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("[EmailJS] Success:", response.data);
    } catch (error) {
        console.error("Email send failed:", error.response?.data || error.message);
    }
};

// Admin signup request
export const requestAdminAccess = async (req, res) => {
    try {
        const { email, fullName, reason } = req.body;

        if (!email || !fullName || !reason) {
            return res.status(400).json({
                success: false,
                message: "Email, fullName, and reason are required",
            });
        }

        // Check if already requested
        const existingRequest = await AdminRequest.findOne({ email });
        if (existingRequest) {
            if (existingRequest.status === "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Your request is already pending",
                });
            }
            if (existingRequest.status === "approved") {
                return res.status(400).json({
                    success: false,
                    message: "You already have admin access",
                });
            }
        }

        // Check if already admin
        const existingAdmin = await AdminUser.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "You already have admin access",
            });
        }

        // Create new request
        const adminRequest = new AdminRequest({
            email,
            fullName,
            reason,
        });

        await adminRequest.save();

        // Send email to master admin
        const adminPanelLink = `${process.env.FRONTEND_URL || "http://localhost:5174"}/admin/approve-requests`;
        const emailHtml = `
      <h2>New Admin Access Request</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>
        <a href="${adminPanelLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Review Request in Admin Panel
        </a>
      </p>
    `;

        await sendEmail(MASTER_ADMIN_EMAIL, "New Admin Access Request", emailHtml);

        res.status(201).json({
            success: true,
            message:
                "Admin access request submitted. Please wait for approval from the master admin.",
            data: adminRequest,
        });
    } catch (error) {
        console.error("Admin request error:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting admin request",
        });
    }
};

// Get request status
export const getAdminRequestStatus = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const request = await AdminRequest.findOne({ email });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "No request found",
            });
        }

        res.json({
            success: true,
            data: request,
        });
    } catch (error) {
        console.error("Get request status error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching request status",
        });
    }
};

// Get all pending requests (Master admin only)
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const adminUser = await AdminUser.findOne({ userId });

        if (!adminUser || adminUser.role !== "master_admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized - Only master admin can access this",
            });
        }

        const pendingRequests = await AdminRequest.find({ status: "pending" });

        res.json({
            success: true,
            data: pendingRequests,
        });
    } catch (error) {
        console.error("Get pending requests error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching pending requests",
        });
    }
};

// Approve admin request
export const approveAdminRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.params;
        const adminUser = await AdminUser.findOne({ userId });

        if (!adminUser || adminUser.role !== "master_admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized - Only master admin can approve requests",
            });
        }

        const adminRequest = await AdminRequest.findById(requestId);
        if (!adminRequest) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        // Find or create user with this email
        let user = await User.findOne({ email: adminRequest.email });
        if (!user) {
            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-12); // Random 12-char password
            const hashedPassword = await bcryptjs.hash(tempPassword, 10);

            user = new User({
                email: adminRequest.email,
                name: adminRequest.fullName,
                password: hashedPassword,
                class: 10, // Default class for admin
            });
            await user.save();

            // Send temporary password email
            const tempPasswordEmail = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Admin Access Approved!</h2>
                <p>Congratulations! Your admin access request has been approved.</p>
                <p>Your temporary password is:</p>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h1 style="letter-spacing: 2px; color: #2563eb; font-family: monospace;">${tempPassword}</h1>
                </div>
                <p style="color: #d32f2f;"><strong>⚠️ Please change this password after your first login.</strong></p>
                <p>You can now log in to the admin panel using your email and this password.</p>
            </div>
            `;

            await sendEmail(
                adminRequest.email,
                "Admin Access Approved - Temporary Password",
                tempPasswordEmail
            );
        }

        // Create admin user
        const newAdmin = new AdminUser({
            userId: user._id,
            email: adminRequest.email,
            role: "admin",
            permissions: {
                uploadNotes: true,
                uploadPYQ: true,
                manageEvents: true,
                sendNotifications: true,
                manageAdmins: false,
            },
        });

        await newAdmin.save();

        // Update admin request
        adminRequest.status = "approved";
        adminRequest.approvedBy = userId;
        adminRequest.approvedDate = new Date();
        await adminRequest.save();

        // If user was just created, password email was already sent above
        // If user already existed, send login link
        if (await User.findOne({ email: adminRequest.email, createdAt: { $lt: new Date(Date.now() - 60000) } })) {
            const loginLink = `${process.env.FRONTEND_URL || "http://localhost:5174"}/admin/login`;
            const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Admin Access Approved!</h2>
                <p>Your admin access request has been approved.</p>
                <p>You can now log in to the admin panel using your existing credentials.</p>
                <p>
                    <a href="${loginLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Login to Admin Panel
                    </a>
                </p>
            </div>
            `;

            await sendEmail(
                adminRequest.email,
                "Admin Access Approved",
                emailHtml
            );
        }

        res.json({
            success: true,
            message: "Admin request approved",
            data: newAdmin,
        });
    } catch (error) {
        console.error("Approve admin request error:", error);
        res.status(500).json({
            success: false,
            message: "Error approving admin request",
        });
    }
};

// Reject admin request
export const rejectAdminRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.params;
        const { rejectionReason } = req.body;

        const adminUser = await AdminUser.findOne({ userId });
        if (!adminUser || adminUser.role !== "master_admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized - Only master admin can reject requests",
            });
        }

        const adminRequest = await AdminRequest.findById(requestId);
        if (!adminRequest) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        adminRequest.status = "rejected";
        adminRequest.rejectionReason = rejectionReason || "Request denied";
        await adminRequest.save();

        // Send rejection email
        const emailHtml = `
      <h2>Admin Access Request Rejected</h2>
      <p>Unfortunately, your admin access request has been rejected.</p>
      <p><strong>Reason:</strong> ${adminRequest.rejectionReason}</p>
      <p>If you have any questions, please contact the master admin.</p>
    `;

        await sendEmail(adminRequest.email, "Admin Access Request Rejected", emailHtml);

        res.json({
            success: true,
            message: "Admin request rejected",
        });
    } catch (error) {
        console.error("Reject admin request error:", error);
        res.status(500).json({
            success: false,
            message: "Error rejecting admin request",
        });
    }
};

// Get admin user info
export const getAdminInfo = async (req, res) => {
    try {
        const userId = req.user._id;
        const adminUser = await AdminUser.findOne({ userId }).populate("userId");

        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found",
            });
        }

        let responseData = adminUser.toObject();

        // Grant full permissions to master_admin
        if (adminUser.role === "master_admin") {
            responseData.permissions = {
                uploadNotes: true,
                uploadPYQ: true,
                manageEvents: true,
                sendNotifications: true,
                manageAdmins: true,
            };
        }

        res.json({
            success: true,
            data: responseData,
        });
    } catch (error) {
        console.error("Get admin info error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching admin info",
        });
    }
};



// Admin login (verify email has admin access)
export const adminLoginNew = async (req, res) => {
    console.log("HITTING NEW ADMIN LOGIN LOGIC");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Check if user has admin access
        const adminUser = await AdminUser.findOne({ email, isActive: true }).populate("userId");

        if (!adminUser) {
            // Check if there's a pending request
            const pendingRequest = await AdminRequest.findOne({
                email,
                status: "pending",
            });

            if (pendingRequest) {
                return res.status(403).json({
                    success: false,
                    message: "pending",
                    data: {
                        requestDate: pendingRequest.requestDate,
                        masterAdminEmail: MASTER_ADMIN_EMAIL,
                    },
                });
            }

            // Check for rejected request
            const rejectedRequest = await AdminRequest.findOne({
                email,
                status: "rejected",
            });

            if (rejectedRequest) {
                return res.status(403).json({
                    success: false,
                    message: "rejected",
                    data: {
                        rejectionReason: rejectedRequest.rejectionReason,
                        masterAdminEmail: MASTER_ADMIN_EMAIL,
                    },
                });
            }

            return res.status(403).json({
                success: false,
                message: "notfound",
                data: {
                    masterAdminEmail: MASTER_ADMIN_EMAIL,
                },
            });
        }

        // Verify password
        const isPasswordValid = await bcryptjs.compare(password, adminUser.userId.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Bypass OTP: Login directly
        const token = jwt.sign(
            {
                id: adminUser.userId._id,
                email: adminUser.userId.email,
                role: adminUser.role,
            },
            process.env.JWT_SECRET || "default-secret",
            { expiresIn: "30d" }
        );

        return res.json({
            success: true,
            message: "Login successful",
            data: {
                ...adminUser.toObject(),
                token,
                user: adminUser.userId,
                requiresOTP: false,
            },
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            success: false,
            message: "Error during admin login",
        });
    }
};

// Send Login OTP (for all admins / Resend)
export const sendLoginOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user is admin (any role)
        const adminUser = await AdminUser.findOne({ email, isActive: true });
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        // Send OTP via MojoAuth
        const result = await sendOtp({ email }, "admin_login");

        if (!result.success) {
            return res.status(result.status || 500).json({
                success: false,
                message: result.message || "Failed to send OTP"
            });
        }

        res.json({
            success: true,
            message: "OTP sent to admin email",
            data: {
                email,
            },
        });
    } catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Error sending OTP",
        });
    }
};

// Verify Login OTP (for all admins)
export const verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // Check if user is admin
        const adminUser = await AdminUser.findOne({ email, isActive: true }).populate("userId");
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        // Retrieve state_id
        const state_id = await redis.get(`mojoState:${email}`);
        if (!state_id) {
            return res.status(400).json({
                success: false,
                message: "OTP Session expired or invalid",
            });
        }

        // Verify with MojoAuth
        try {
            await verifyMojoAuthToken(otp, state_id);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: `Verification Failed: ${err.message}`
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: adminUser.userId._id,
                email: adminUser.userId.email,
                role: adminUser.role,
            },
            process.env.JWT_SECRET || "default-secret",
            { expiresIn: "30d" }
        );

        // Clear OTP from Redis
        await redis.del(`mojoState:${email}`);

        // Send login confirmation email
        await sendEmail(
            email,
            "Admin Login Successful",
            `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Admin Login Confirmed</h2>
                <p>You have successfully logged in to the admin panel.</p>
                <p>If this wasn't you, please change your password immediately.</p>
                <p style="color: #666; font-size: 12px;">Login Time: ${new Date().toLocaleString()}</p>
            </div>
            `
        );

        res.json({
            success: true,
            message: "Admin verified with OTP",
            data: {
                ...adminUser.toObject(),
                token,
                user: adminUser.userId,
            },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Error verifying OTP",
        });
    }
};

// Forgot password - Send OTP
export const forgotPasswordSendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if admin exists
        const adminUser = await AdminUser.findOne({ email, isActive: true });
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found",
            });
        }

        // Send OTP via MojoAuth
        // We use "admin_login" type to bypass the "User" collection check in sendOtp, 
        // effectively reusing the logic just for sending OTP and setting Redis state.
        const result = await sendOtp({ email }, "admin_login");

        if (!result.success) {
            return res.status(result.status || 500).json({
                success: false,
                message: result.message || "Failed to send OTP"
            });
        }

        res.json({
            success: true,
            message: "OTP sent to your email",
            data: {
                email,
            },
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Error sending OTP",
        });
    }
};

// Verify OTP and reset password
export const verifyOTPAndResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        // Check if admin exists
        const adminUser = await AdminUser.findOne({ email, isActive: true });
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found",
            });
        }

        // Retrieve state_id
        const state_id = await redis.get(`mojoState:${email}`);
        if (!state_id) {
            return res.status(400).json({
                success: false,
                message: "OTP Session expired or invalid",
            });
        }

        // Verify with MojoAuth
        try {
            await verifyMojoAuthToken(otp, state_id);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: `Verification Failed: ${err.message}`
            });
        }

        // Update password
        const user = await User.findById(adminUser.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Clear OTP from Redis
        await redis.del(`mojoState:${email}`);

        // Send confirmation email
        await sendEmail(
            email,
            "Password Reset Successful",
            `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Successful</h2>
                <p>Your admin panel password has been successfully reset.</p>
                <p>You can now log in with your new password.</p>
            </div>
            `
        );

        res.json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Error resetting password",
        });
    }
};

// Get All Users (for Admin Analytics)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "name email class streak lastLoginDate");
        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
        });
    }
};

// Get Single User Analytics
export const getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId, "-password -refreshTokens");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Fetch Quiz Attempts
        const quizAttempts = await QuizAttempt.find({ user: userId })
            .populate("quiz", "title topic")
            .sort({ startTime: -1 });

        // Fetch Study Progress
        const progress = await Progress.find({ studentId: userId });

        res.json({
            success: true,
            data: {
                user,
                quizAttempts,
                progress,
            },
        });
    } catch (error) {
        console.error("Get user analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user analytics",
        });
    }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    console.log("HITTING DASHBOARD STATS ENDPOINT");
    try {
        // 1. Total Students
        const totalStudents = await User.countDocuments({});
        console.log("Total Students:", totalStudents);

        // 2. Active Today (logged in since midnight)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const activeToday = await User.countDocuments({ lastLoginDate: { $gte: startOfToday } });
        console.log("Active Today:", activeToday);

        // 3. Total Notes (Aggregation across all SubjectNotes + HTML Static Notes)
        const allNotesDocs = await SubjectNotes.find({});
        const dbNotesCount = allNotesDocs.reduce((acc, doc) => acc + (doc.notes ? doc.notes.length : 0), 0);

        // Helper to count HTML files recursively
        const countHtmlFiles = async (dir) => {
            let count = 0;
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const res = path.resolve(dir, entry.name);
                    if (entry.isDirectory()) {
                        count += await countHtmlFiles(res);
                    } else if (entry.isFile() && entry.name.endsWith('.html')) {
                        count++;
                    }
                }
            } catch (e) {
                // Ignore if directory doesn't exist
            }
            return count;
        };

        const grade10NotesPath = path.join(__dirname, "..", "..", "grade10");
        const grade9NotesPath = path.join(__dirname, "..", "..", "grade9");

        const grade10HtmlCount = await countHtmlFiles(grade10NotesPath);
        const grade9HtmlCount = await countHtmlFiles(grade9NotesPath);

        const totalNotes = dbNotesCount + grade10HtmlCount + grade9HtmlCount;

        console.log(`Total Notes: ${totalNotes} (DB: ${dbNotesCount}, G10 HTML: ${grade10HtmlCount}, G9 HTML: ${grade9HtmlCount})`);

        // 4. Pending Requests
        const pendingRequests = await AdminRequest.countDocuments({ status: "pending" });
        console.log("Pending Requests:", pendingRequests);

        // 5. Total PYQs (from JSON manifest)
        const pyqManifestPath = path.join(__dirname, "..", "..", "grade10", "PYQ", "pyq-list.json");
        let totalPYQs = 0;
        try {
            const raw = await fs.readFile(pyqManifestPath, "utf-8");
            const manifest = JSON.parse(raw);
            totalPYQs = Object.values(manifest).reduce((acc, subjectList) => acc + (Array.isArray(subjectList) ? subjectList.length : 0), 0);
        } catch (e) {
            console.warn("PYQ Manifest read error:", e.message);
        }

        // 6. Enrollment Trends (Cumulative Growth over Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const enrollmentRaw = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const studentsBefore30Days = await User.countDocuments({ createdAt: { $lt: thirtyDaysAgo } });
        let cumulative = studentsBefore30Days;

        const enrollmentTrends = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = enrollmentRaw.find(r => r._id === dateStr);
            const dailyCount = found ? found.count : 0;
            cumulative += dailyCount;

            enrollmentTrends.push({
                name: new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                students: cumulative
            });
        }

        // 7. Recent Admissions (Last 72 Hours)
        const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
        console.log("Fetching admissions since:", seventyTwoHoursAgo);

        const recentAdmissionsRaw = await User.find({
            createdAt: { $gte: seventyTwoHoursAgo }
        }).sort({ createdAt: -1 }).limit(10).select("name class createdAt streak");

        const recentAdmissions = recentAdmissionsRaw.map(u => ({
            id: u._id,
            name: u.name,
            course: `Class ${u.class}`,
            date: new Date(u.createdAt).toLocaleDateString() + " " + new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: u.streak > 0 ? "Active" : "New"
        }));

        console.log("Recent Admissions Found:", recentAdmissions.length);

        res.json({
            success: true,
            data: {
                metrics: {
                    totalStudents,
                    activeToday,
                    totalNotes,
                    pendingRequests
                },
                charts: {
                    enrollment: enrollmentTrends,
                    contentDistribution: [
                        { name: 'Notes', value: totalNotes },
                        { name: 'PYQs', value: totalPYQs },
                        { name: 'Tests', value: 0 } // Placeholder for future test features
                    ]
                },
                recentAdmissions
            }
        });

    } catch (error) {
        console.error("Dashboard stats CRITICAL error:", error);
        res.status(500).json({ success: false, message: "Error loading dashboard data" });
    }
};

// Get All Admins
export const getAllAdmins = async (req, res) => {
    try {
        console.log("getAllAdmins called by:", req.user?.userId);
        const admins = await AdminUser.find().populate("userId", "name email profilePicture");
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error("Get All Admins Error:", error);
        res.status(500).json({ success: false, message: "Error fetching admins" });
    }
};

// Update Admin Permissions (Master Only)
export const updateAdminPermissions = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { permissions } = req.body;

        const admin = await AdminUser.findById(adminId);
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        if (admin.role === 'master_admin') {
            return res.status(403).json({ success: false, message: "Cannot modify Master Admin permissions" });
        }

        admin.permissions = { ...admin.permissions, ...permissions };
        await admin.save();

        res.json({ success: true, message: "Permissions updated successfully", data: admin });
    } catch (error) {
        console.error("Update Permissions Error:", error);
        res.status(500).json({ success: false, message: "Error updating permissions" });
    }
};

// Toggle Admin Access (Revoke/Grant) (Master Only)
export const toggleAdminAccess = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { isActive } = req.body; // true = Grant, false = Revoke

        const admin = await AdminUser.findById(adminId);
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        if (admin.role === 'master_admin') {
            return res.status(403).json({ success: false, message: "Cannot revoke Master Admin access" });
        }

        admin.isActive = isActive;
        await admin.save();

        res.json({ success: true, message: `Admin access ${isActive ? 'granted' : 'revoked'}` });
    } catch (error) {
        console.error("Toggle Access Error:", error);
        res.status(500).json({ success: false, message: "Error updating access" });
    }
};

// Send Notification
export const sendNotification = async (req, res) => {
    try {
        const { title, message, targetAudience, class: targetClass, priority } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }

        const newNotification = new Notification({
            title,
            message,
            targetAudience,
            targetClass,
            priority
        });

        await newNotification.save();

        res.status(201).json({
            success: true,
            message: "Notification sent successfully",
            data: newNotification
        });
    } catch (error) {
        console.error("Send Notification Error:", error);
        res.status(500).json({ success: false, message: "Error sending notification" });
    }
};

