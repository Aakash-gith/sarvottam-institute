import redis from "../conf/redis.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/Users.js";
import mojoAuth from "../conf/mojoauth.js";
import axios from "axios";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer"; // Added Nodemailer

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;


// Generate Tokens
export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, name: user.name, class: user.class },
    JWT_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Refresh Tokens
export const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "Token required" });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if token exists
    if (!user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // --- Rotate Refresh Token ---
    const newTokens = generateTokens(user);

    // Remove the used refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);

    // Add the new one
    user.refreshTokens.push(newTokens.refreshToken);

    // Optional: keep last 5 tokens to prevent accumulation
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    return res.status(200).json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (err) {
    console.error("refreshToken error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};


// GENERIC EMAIL FUNCTION (NODEMAILER)
export const sendEmail = async (to, subject, html) => {
  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASS;

    if (!user || !pass) {
      console.warn("[Nodemailer] Missing GMAIL_USER or GMAIL_PASS. Emails will not send.");
      throw new Error("Missing Gmail Credentials in .env");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from: `"Sarvottam Institute" <${user}>`,
      to,
      subject,
      html
    });

    console.log(`[Nodemailer] Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Nodemailer] Failed:", error.message);
    throw error;
  }
};

// Internal Helper for OTP (uses the generic function)
const sendOtpEmail = async (email, otp) => {
  const html = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #2563eb; padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Sarvottam Institute</h1>
  </div>
  <div style="padding: 32px; background-color: #ffffff;">
    <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">Confirm your email address,</p>
    <p style="color: #4b5563; font-size: 16px; margin-bottom: 8px;">Your verification code is:</p>
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <h2 style="letter-spacing: 8px; font-size: 32px; color: #111827; margin: 0;">${otp}</h2>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">This code will expire in 10 minutes. For security, please do not share this code with anyone.</p>
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Sarvottam Institute. All rights reserved.</p>
  </div>
</div>
  `;
  return await sendEmail(email, "Your Verification Code", html);
};


// USER HELPERS
export const checkUserExists = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  return user;
};

// SEND OTP (Now exclusively using Nodemailer)
export const sendOtp = async (user, type = "signup") => {
  try {
    const { name, email, password, class: userClass } = user;

    if (
      (type === "signup" && (!email || !name || !userClass || !password)) ||
      (type === "reset" && !email) ||
      (type === "admin_login" && !email)
    ) {
      return { success: false, status: 400, message: "All fields required" };
    }

    // Skip user existence check for admin_login (handled by admin controller)
    if (type !== "admin_login") {
      const exists = await checkUserExists(email);
      if (type === "signup" && exists)
        return {
          success: false,
          status: 409,
          message: "Email already registered",
        };
      if (type === "reset" && !exists)
        return { success: false, status: 404, message: "User not found" };
    }

    // Store temp user data if signup/reset (not needed for admin_login)
    if (password && type !== "admin_login") {
      const hashedPassword = await bcrypt.hash(password, 10);
      const tempData =
        type === "signup"
          ? { name, email, password: hashedPassword, class: userClass }
          : { email, password: hashedPassword };

      console.log(`[sendOtp] Storing tempUserData in Redis for ${email}`);
      await redis.set(`tempUser:${email}`, JSON.stringify(tempData), { ex: 600 }); // 10 min expiry
    }

    console.log(`[Nodemailer] Generating local OTP for ${email}`);
    const localOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false
    });

    console.log(`[Nodemailer] Sending OTP to ${email}`);
    await sendOtpEmail(email, localOtp);

    // Store local state with specialized prefix to maintain compatibility with verifyMojoAuthToken
    await redis.set(`mojoState:${email}`, `LOCAL:${localOtp}`, { ex: 300 }); // 5 min

    return { success: true, status: 200, message: "OTP sent to email via Nodemailer" };
  } catch (err) {
    console.error(`[Nodemailer] Error sending OTP for ${user?.email}:`, err.message);
    return {
      success: false,
      status: 500,
      message: `Failed to send OTP: ${err.message}`,
      error: err.message
    };
  }
};

// RESEND OTP (Now exclusively using Nodemailer)
export const resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ success: false, message: "Email and type required" });
    }

    const exists = await checkUserExists(email);
    if (type === "signup" && exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    if (type === "reset" && !exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log(`[Nodemailer] Resending OTP to ${email}`);
    const localOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false
    });

    await sendOtpEmail(email, localOtp);
    await redis.set(`mojoState:${email}`, `LOCAL:${localOtp}`, { ex: 300 }); // 5 min

    return res.status(200).json({ success: true, message: "OTP sent to email via Nodemailer" });
  } catch (err) {
    console.error("[Nodemailer] resendOtp error:", err);
    return res.status(500).json({ success: false, message: "Failed to resend OTP", error: err.message });
  }
};


// Core Verification Logic (Now only handles local OTPs)
export const verifyMojoAuthToken = async (otp, state_id) => {
  try {
    if (!state_id) throw new Error("Verification session expired");

    // All OTPs are now local
    let expectedOtp = state_id;
    if (state_id.startsWith("LOCAL:")) {
      expectedOtp = state_id.split(":")[1];
    }

    console.log(`[Nodemailer] Verifying local OTP`);
    if (String(otp) === String(expectedOtp)) {
      return {
        authenticated: true,
        user: { email: "verified@local" },
        description: "Verification Successful"
      };
    } else {
      throw new Error("Invalid OTP code. Please check your email.");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// VERIFY OTP (MojoAuth) - User Controller Handler
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    console.log(`[VerifyOtp] Request: email=${email}, otp=${otp}, type=${type}`);

    // Retrieve state_id
    const state_id = await redis.get(`mojoState:${email}`);
    if (!state_id) {
      return res.status(400).json({ message: "OTP Session expired or invalid" });
    }

    // Verify with MojoAuth
    try {
      await verifyMojoAuthToken(otp, state_id);
    } catch (err) {
      return res.status(400).json({ message: `Verification Failed: ${err.message}` });
    }

    // Proceed with logic
    console.log("[VerifyOtp] Proceeding to User Logic...");

    if (type === "signup") {
      const tempUserDataRaw = await redis.get(`tempUser:${email}`);
      console.log(`[VerifyOtp] Signup tempUser type: ${typeof tempUserDataRaw}`);

      if (!tempUserDataRaw)
        return res.status(400).json({ message: "Session expired (User Data missing)" });

      let userData;
      if (typeof tempUserDataRaw === 'string') {
        userData = JSON.parse(tempUserDataRaw);
      } else {
        userData = tempUserDataRaw;
      }

      const newUser = new User(userData);
      const { accessToken, refreshToken } = generateTokens(newUser);

      newUser.refreshTokens = [refreshToken];
      await newUser.save();
      console.log("[VerifyOtp] User saved to DB.");

      await redis.del(`mojoState:${email}`);
      await redis.del(`tempUser:${email}`);

      return res.status(200).json({
        message: "Signup successful",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          class: newUser.class,
        },
        accessToken,
        refreshToken,
      });
    }

    if (type === "reset") {
      const tempUserDataRaw = await redis.get(`tempUser:${email}`);
      if (!tempUserDataRaw)
        return res.status(400).json({ message: "Session expired (User Data missing)" });

      let userData;
      if (typeof tempUserDataRaw === 'string') {
        userData = JSON.parse(tempUserDataRaw);
      } else {
        userData = tempUserDataRaw;
      }

      const { password } = userData;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      await User.updateOne({ email }, { password });

      await redis.del(`mojoState:${email}`);
      await redis.del(`tempUser:${email}`);

      return res.status(200).json({ message: "Password reset successful" });
    }

    return res.status(400).json({ message: "Invalid request type" });
  } catch (err) {
    console.error("[VerifyOtp] Outer Error:", err);
    return res.status(400).json({ message: `Verification System Error: ${err.message}` });
  }
};
