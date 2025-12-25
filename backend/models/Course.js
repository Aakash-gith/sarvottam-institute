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
