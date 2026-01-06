import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticketId: {
        type: String,
        unique: true,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Technical', 'Academic', 'Payment', 'Batch/Class Change', 'General', 'Other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    type: {
        type: String,
        enum: ['Ticket', 'Email'],
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    tags: {
        role: String,
        class: String,
        course: String
    },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'messages.senderModel'
        },
        senderModel: {
            type: String,
            enum: ['User', 'AdminUser'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        attachments: [String],
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    internalNotes: [{
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdminUser'
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    history: [{
        action: String,
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdminUser'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
