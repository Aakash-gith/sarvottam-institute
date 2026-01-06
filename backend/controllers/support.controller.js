import SupportTicket from "../models/SupportTicket.js";
import User from "../models/Users.js";
import AdminUser from "../models/AdminUser.js";

export const createTicket = async (req, res) => {
    try {
        const { subject, category, description, type, tags } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const ticketNumber = `SI-${Math.floor(100000 + Math.random() * 900000)}`;

        const newTicket = new SupportTicket({
            user: userId,
            ticketId: ticketNumber,
            subject,
            category,
            description,
            type: type || 'Ticket',
            tags: {
                role: user.role || 'student',
                class: user.class || tags?.class || 'N/A',
                course: tags?.course || 'N/A'
            },
            messages: [{
                sender: userId,
                senderModel: 'User',
                text: description
            }],
            history: []
        });

        await newTicket.save();
        res.status(201).json({ success: true, data: newTicket });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await SupportTicket.find({ user: userId }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllTicketsAdmin = async (req, res) => {
    try {
        const { status, type, category } = req.query;
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (category) query.category = category;

        const tickets = await SupportTicket.find(query)
            .populate('user', 'name email profilePicture')
            .populate('assignedTo', 'name email')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user.id;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.status = status;
        ticket.history.push({
            action: `Status changed to ${status}`,
            performedBy: req.admin ? req.admin._id : null
        });

        await ticket.save();
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const assignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;
        const currentAdminId = req.user.id;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.assignedTo = adminId;
        ticket.history.push({
            action: `Assigned ticket to admin`,
            performedBy: req.admin ? req.admin._id : null
        });

        await ticket.save();
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, senderModel } = req.body;
        const senderId = req.user.id;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.messages.push({
            sender: req.admin ? req.admin._id : senderId,
            senderModel: senderModel || (req.admin ? 'AdminUser' : 'User'),
            text,
            timestamp: new Date()
        });

        ticket.history.push({
            action: `New message added by ${senderModel || (req.admin ? 'AdminUser' : 'User')}`,
            performedBy: req.admin ? req.admin._id : null
        });

        await ticket.save();
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addInternalNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const adminId = req.user.id;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.internalNotes.push({
            admin: req.admin._id,
            text,
            timestamp: new Date()
        });

        await ticket.save();
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTicketDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await SupportTicket.findById(id)
            .populate('user', 'name email profilePicture')
            .populate({
                path: 'assignedTo',
                select: 'userId',
                populate: { path: 'userId', select: 'name email' }
            })
            .populate({
                path: 'messages.sender',
                select: 'name email profilePicture userId',
            })
            .populate({
                path: 'internalNotes.admin',
                select: 'userId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate({
                path: 'history.performedBy',
                select: 'userId',
                populate: { path: 'userId', select: 'name' }
            });

        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
