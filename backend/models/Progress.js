import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    classId: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    subjectId: {
      type: Number,
      required: true,
    },

    lecturesWatched: {
      type: Number,
      default: 0,
      min: 0,
    },

    notesRead: {
      type: Number,
      default: 0,
      min: 0,
    },

    notesCompleted: {
      type: [String],
      default: [],
    },

    notesInProgress: {
      type: [String],
      default: [],
    },

    videosCompleted: {
      type: [String],
      default: [],
    },

    videosInProgress: {
      type: [String],
      default: [],
    },

    completion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate records for the same subject + semester + user
progressSchema.index(
  { studentId: 1, classId: 1, subjectId: 1 },
  { unique: true }
);

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
