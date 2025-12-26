import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
    },
    class: {
      type: Number,
      required: true,
      enum: [9, 10],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshTokens: {
      type: [String],
      default: [],
      // validate: [(arr) => arr.length <= 5, "Too many active sessions"],
    },
    streak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    deletedChats: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      deletedAt: { type: Date, default: Date.now }
    }],
    pinnedChats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    mutedChats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    markedUnreadChats: [{ // For manually marking as unread
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
