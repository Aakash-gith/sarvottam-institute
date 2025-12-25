import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    startTime: {
        type: Date,
        required: true
    },
    durationMinutes: {
        type: Number,
        default: 60
    },
    hmsRoomId: {
        type: String,
        required: true // 100ms Room ID
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    recordingUrl: {
        type: String
    },
    isDemo: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('LiveClass', liveClassSchema);
