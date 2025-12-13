import redis from "../conf/redis.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/Users.js";
import mojoAuth from "../conf/mojoauth.js";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// EmailJS Config
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

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


// EMAIL (Via EmailJS REST API)
const sendOtpEmail = async (email, otp) => {
  try {
    const data = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: email,
        otp: otp,
        app_name: "Sarvottam Institute"
      }
    };

    console.log(`[EmailJS] Sending OTP ${otp} to ${email}...`);

    // EmailJS REST API endpoint
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("[EmailJS] Success:", response.data);
    return true;

  } catch (error) {
    console.error("[EmailJS] FAILED:", error.response?.data || error.message);
    throw new Error(`EmailJS Failed: ${JSON.stringify(error.response?.data || error.message)}`);
  }
};

// USER HELPERS
export const checkUserExists = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  return user;
};

// SEND OTP (MojoAuth)
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

    // Store temp user data if signup/reset
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const tempData =
        type === "signup"
          ? { name, email, password: hashedPassword, class: userClass }
          : { email, password: hashedPassword };

      console.log(`[sendOtp] Storing tempUserData in Redis for ${email}`);
      await redis.set(`tempUser:${email}`, JSON.stringify(tempData), { ex: 600 }); // 10 min expiry
    }

    console.log(`[MojoAuth] Sending OTP to ${email}`);

    // MojoAuth: Send OTP
    const response = await mojoAuth.mojoAPI.signinWithEmailOTP(email, {});
    console.log("[MojoAuth] Response:", response);

    // Store "state_id" in Redis to verify later
    // MojoAuth response usually contains { state_id: "..." }
    // We map email -> state_id
    if (response && response.state_id) {
      await redis.set(`mojoState:${email}`, response.state_id, { ex: 300 }); // 5 min
    } else {
      throw new Error("MojoAuth did not return a state_id");
    }

    return { success: true, status: 200, message: "OTP sent to email" };
  } catch (err) {
    console.error(`[MojoAuth] Error sending OTP for ${user?.email}:`, err);
    return { success: false, status: 500, message: "Failed to send OTP", error: err.message };
  }
};

// RESEND OTP (MojoAuth)
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

    console.log(`[MojoAuth] Resending OTP to ${email}`);
    const response = await mojoAuth.mojoAPI.signinWithEmailOTP(email, {});


    if (response && response.state_id) {
      await redis.set(`mojoState:${email}`, response.state_id, { ex: 300 }); // 5 min
      return res.status(200).json({ success: true, message: "OTP sent to email" });
    } else {
      throw new Error("MojoAuth did not return a state_id");
    }

  } catch (err) {
    console.error("resendOtp error:", err);
    return res.status(500).json({ success: false, message: "Failed to resend OTP", error: err.message });
  }
};

// VERIFY OTP (MojoAuth)
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    console.log(`[VerifyOtp] Request: email=${email}, otp=${otp}, type=${type}`);

    // Retrieve state_id
    const state_id = await redis.get(`mojoState:${email}`);
    console.log(`[VerifyOtp] Redis state_id: ${state_id}`);

    if (!state_id) {
      console.warn("[VerifyOtp] Missing state_id in Redis");
      return res.status(400).json({ message: "OTP Session expired or invalid" });
    }

    // Verify with MojoAuth (Direct API Call to bypass SDK bug)
    console.log(`[MojoAuth] Verifying OTP for ${email} with state ${state_id}`);

    try {
      const verifyResponse = await axios.post(
        "https://api.mojoauth.com/users/emailotp/verify",
        {
          otp: otp,
          state_id: state_id
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.MOJOAUTH_API_KEY
          }
        }
      );

      console.log("[MojoAuth] Verify Response Status:", verifyResponse.status);
      console.log("[MojoAuth] Verify Response Body Type:", typeof verifyResponse.data);
      console.log("[MojoAuth] Verify Response Body:", JSON.stringify(verifyResponse.data, null, 2));

      // Flexible success check
      const data = verifyResponse.data;
      const isAuthenticated = data && (
        data.authenticated === true ||
        data.user ||
        data.access_token ||
        data.oauth_token ||
        data.refresh_token // Use refresh_token as proof of success too
      );

      console.log(`[VerifyOtp] isAuthenticated result: ${!!isAuthenticated}`);

      if (!isAuthenticated) {
        console.error("[VerifyOtp] isAuthenticated failed despite response data.");
        throw new Error("Verification failed: Valid authentication tokens missing in response");
      }

    } catch (apiError) {
      console.error("[MojoAuth] API Verification Failed (Inner Catch):", apiError.response?.data || apiError.message);
      const details = apiError.response?.data?.description || apiError.message;
      return res.status(400).json({
        message: `Verification Failed: ${details}`, // Append details to message for UI visibility
        details: details
      });
    }

    // Proceed with logic
    console.log("[VerifyOtp] Proceeding to User Logic...");

    if (type === "signup") {
      const tempUserDataRaw = await redis.get(`tempUser:${email}`);
      console.log(`[VerifyOtp] Signup tempUser type: ${typeof tempUserDataRaw}`);
      console.log(`[VerifyOtp] Signup tempUser value: ${JSON.stringify(tempUserDataRaw)}`);

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
