import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return this.conversationType === 'direct'; }
    },
    groupReceiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: function () { return this.conversationType === 'group'; }
    },
    conversationType: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct'
    },
    content: {
        type: String,
        trim: true
    },
    file: {
        url: String,
        fileType: String, // Renamed from 'type' to avoid conflict or confusion
        name: String
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    timestamp: { // Explicit timestamp field for display if needed, though createdAt works
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
