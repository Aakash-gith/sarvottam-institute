import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // Track individual content status
    completedContents: [{
        contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
        type: { type: String, required: true }, // 'video', 'note', 'test'
        completedAt: { type: Date, default: Date.now },
        score: { type: Number }, // For tests/quizzes
        meta: { type: mongoose.Schema.Types.Mixed } // Extra data like video watch duration
    }],
    // Aggregated progress (calculated on update)
    chapterProgress: [{
        subject: String,
        chapterTitle: String,
        percentage: { type: Number, default: 0 },
        status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
        lastUpdated: { type: Date, default: Date.now }
    }],
    subjectProgress: [{
        subject: String,
        percentage: { type: Number, default: 0 }
    }],
    overallProgress: {
        type: Number,
        default: 0
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure one progress record per user per course
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('CourseProgress', courseProgressSchema);
