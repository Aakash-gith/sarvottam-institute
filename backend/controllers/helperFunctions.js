import redis from "../conf/redis.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import User from "../models/Users.js";
import { Resend } from "resend";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// Resend Configuration
// checks for API key in env
const resend = new Resend(process.env.RESEND_API_KEY);

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


// EMAIL (Via Resend)
const sendOtpEmail = async (email, otp) => {
  try {
    console.log(`[Resend] Sending OTP ${otp} to ${email}...`);

    const { data, error } = await resend.emails.send({
      from: "Sarvottam Institute <onboarding@resend.dev>", // Default testing domain
      to: [email],
      subject: "Your OTP for Sarvottam Institute",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Sarvottam Institute</h2>
          <p>Your Verification Code:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px; color: #000;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] Error:", error);
      throw new Error(error.message);
    }

    console.log("[Resend] Success:", data);
    return data;
  } catch (error) {
    console.error("[Resend] FAILED:", error);
    throw error;
  }
};

// USER HELPERS
export const checkUserExists = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  return user;
};

// SEND OTP
export const sendOtp = async (user, type = "signup") => {
  try {
    const { name, email, password, class: userClass } = user;

    if (
      (type === "signup" && (!email || !name || !userClass || !password)) ||
      (type === "reset" && !email)
    ) {
      return { success: false, status: 400, message: "All fields required" };
    }

    const exists = await checkUserExists(email);
    if (type === "signup" && exists)
      return {
        success: false,
        status: 409,
        message: "Email already registered",
      };
    if (type === "reset" && !exists)
      return { success: false, status: 404, message: "User not found" };

    console.log(`[sendOtp] Generating OTP for ${email}`);
    let otp = await redis.get(`otp:${email}`);
    if (!otp) {
      otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      console.log(`[sendOtp] Storing new OTP in Redis for ${email}`);
      await redis.set(`otp:${email}`, otp, { ex: 300 }); // 5 min expiry
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const tempData =
        type === "signup"
          ? { name, email, password: hashedPassword, class: userClass }
          : { email, password: hashedPassword };

      console.log(`[sendOtp] Storing tempUserData in Redis for ${email}`);
      await redis.set(`tempUser:${email}`, JSON.stringify(tempData), { ex: 300 });
    }

    console.log(`[sendOtp] Sending email to ${email}`);
    await sendOtpEmail(email, otp);
    console.log(`[sendOtp] Email sent successfully to ${email}`);
    return { success: true, status: 200, message: "OTP sent to email" };
  } catch (err) {
    console.error(`[sendOtp] Error processing OTP for ${user?.email}:`, err);
    return { success: false, status: 500, message: "Failed to send OTP", error: err.message };
  }
};

//RESEND OTP
export const resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Email and type required" });
    }

    // Check user existence based on type
    const exists = await checkUserExists(email);
    if (type === "signup" && exists) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    if (type === "reset" && !exists) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate new OTP - don't require all fields for resend
    try {
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      await redis.set(`otp:${email}`, otp, { ex: 300 }); // 5 min expiry
      await sendOtpEmail(email, otp);

      return res.status(200).json({
        success: true,
        message: "OTP sent to email"
      });
    } catch (err) {
      console.error("Failed to generate and send OTP:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: err.message
      });
    }
  } catch (err) {
    console.error("resendOtp error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to resend OTP" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp || storedOtp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    if (type === "signup") {
      const tempUserData = await redis.get(`tempUser:${email}`);
      if (!tempUserData)
        return res.status(400).json({ message: "Session expired" });

      const userData = JSON.parse(tempUserData);

      // Create the user
      const newUser = new User(userData); // create a Mongoose document
      const { accessToken, refreshToken } = generateTokens(newUser);

      // Save the refresh token to user
      newUser.refreshTokens = [refreshToken];
      await newUser.save();

      // Cleanup Redis
      await redis.del(`otp:${email}`);
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
      const tempUserData = await redis.get(`tempUser:${email}`);
      if (!tempUserData)
        return res.status(400).json({ message: "Session expired" });

      const { password } = JSON.parse(tempUserData);
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      await User.updateOne({ email }, { password });

      await redis.del(`otp:${email}`);
      await redis.del(`tempUser:${email}`);

      return res.status(200).json({ message: "Password reset successful" });
    }

    return res.status(400).json({ message: "Invalid request type" });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
