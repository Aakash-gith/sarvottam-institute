import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["password_reset", "master_admin_login"],
            default: "password_reset",
        },
        otpExpires: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        attempts: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Auto-delete expired OTPs
passwordResetSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PasswordReset", passwordResetSchema);
