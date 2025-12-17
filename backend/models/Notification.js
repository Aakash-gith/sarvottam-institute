import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        targetAudience: {
            type: String,
            enum: ["all", "class"],
            default: "all",
        },
        targetClass: {
            type: String,
            default: null, // e.g., "9" or "10"
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "urgent"],
            default: "normal",
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
