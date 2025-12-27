import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    type: String, // URL
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  classLevel: {
    type: String,
    enum: ['Class 9', 'Class 10'],
    required: true
  },
  subject: {
    type: String,
    enum: ['Maths', 'Science', 'English', 'Social Science', 'All'],
    required: true,
    default: 'All'
  },
  validityMode: {
    type: String,
    enum: ['days', 'date'],
    default: 'days'
  },
  validityValue: {
    type: String, // "365" or "2025-12-31"
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isFreeTrialAvailable: {
    type: Boolean,
    default: false
  },
  studentLimit: {
    type: Number,
    default: 1000
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hasCertificate: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String
  }],
  // Course Curriculum Structure
  curriculum: [{
    subject: {
      type: String,
      required: true
    }, // e.g., 'Maths', 'Science'
    chapters: [{
      title: { type: String, required: true },
      description: String,
      contents: [{
        type: {
          type: String,
          enum: ['video', 'live', 'note', 'test'],
          required: true
        },
        title: { type: String, required: true },
        url: { type: String }, // For video, note link, or live meeting link
        duration: String, // e.g., "45 mins"
        isFree: { type: Boolean, default: false },
        isCompleted: { type: Boolean, default: false } // Basic tracking per user? No, this is schema. Tracking needs separate model or user progress.
      }]
    }]
  }],
  progressSettings: {
    weights: {
      video: { type: Number, default: 30 },
      note: { type: Number, default: 20 },
      test: { type: Number, default: 30 },
      assignment: { type: Number, default: 20 }
    },
    mandatory: {
      video: { type: Boolean, default: false },
      note: { type: Boolean, default: false },
      test: { type: Boolean, default: false },
      assignment: { type: Boolean, default: false }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Course', courseSchema);
