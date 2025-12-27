import Message from '../models/Message.js';
import User from '../models/Users.js';

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, file } = req.body;
        const senderId = req.user._id;

        // Check for blocks
        const senderUser = await User.findById(senderId);
        const receiverUser = await User.findById(receiverId);

        if (!receiverUser) {
            return res.status(404).json({ success: false, message: "Receiver not found" });
        }

        if (senderUser.blockedUsers?.includes(receiverId)) {
            return res.status(403).json({ success: false, message: "You have blocked this user" });
        }
        if (receiverUser.blockedUsers?.includes(senderId)) {
            return res.status(403).json({ success: false, message: "This user has blocked you" });
        }

        console.log(`[Chat] Sending message from ${senderId} to ${receiverId}`);

        if (!receiverId || (!content && !file)) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            file: file ? {
                url: file.url,
                fileType: file.type || 'file',
                name: file.name
            } : undefined,
            status: 'sent'
        });

        const savedMessage = await newMessage.save();
        console.log(`[Chat] Message saved with ID: ${savedMessage._id}`);

        res.status(201).json({ success: true, data: savedMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get conversation with a specific user
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        // Check if user has cleared this chat
        const currentUser = await User.findById(myId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const deletionInfo = currentUser.deletedChats?.find(d => d.userId.toString() === userId.toString());
        const deleteThreshold = deletionInfo ? deletionInfo.deletedAt : new Date(0);

        console.log(`[Chat] Fetching messages between ${myId} and ${userId} after ${deleteThreshold}`);

        // Fetch messages
        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId }
            ],
            createdAt: { $gt: deleteThreshold }
        }).sort({ createdAt: 1 });

        console.log(`[Chat] Found ${messages.length} messages`);

        // Mark unread as delivered
        const unreadMsgIds = messages
            .filter(msg => msg.sender.toString() === userId.toString() && msg.status === 'sent')
            .map(msg => msg._id);

        if (unreadMsgIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMsgIds } },
                { $set: { status: 'delivered' } }
            );
            messages.forEach(msg => {
                if (unreadMsgIds.some(id => id.toString() === msg._id.toString())) {
                    msg.status = 'delivered';
                }
            });
        }

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
    try {
        const myId = req.user._id;

        // Find all messages involving the user
        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }]
        })
            .sort({ createdAt: -1 })
            .populate('sender receiver', 'name email profilePicture');

        const currentUser = await User.findById(myId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const conversationsMap = new Map();

        messages.forEach(msg => {
            // Determine who the "other" person is
            // Note: msg.sender/receiver might be IDs if populate failed, or Objects if it succeeded
            const senderId = (msg.sender?._id || msg.sender)?.toString();
            const receiverId = (msg.receiver?._id || msg.receiver)?.toString();

            if (!senderId || !receiverId) return;

            const isMeSender = senderId === myId.toString();
            const otherUserId = isMeSender ? receiverId : senderId;
            const otherUser = isMeSender ? msg.receiver : msg.sender;

            // Check if chat was deleted and message is before deletion
            if (currentUser.deletedChats) {
                const deletionInfo = currentUser.deletedChats.find(d => d.userId.toString() === otherUserId);
                if (deletionInfo && msg.createdAt <= deletionInfo.deletedAt) return;
            }

            if (!conversationsMap.has(otherUserId)) {
                // If otherUser is just an ID (populate failed), use a placeholder
                const hasPopulated = typeof otherUser === 'object' && otherUser !== null && otherUser.name;

                const isPinned = currentUser.pinnedChats?.includes(otherUserId);
                const isMuted = currentUser.mutedChats?.includes(otherUserId);
                const isMarkedUnread = currentUser.markedUnreadChats?.includes(otherUserId);

                conversationsMap.set(otherUserId, {
                    id: otherUserId,
                    name: hasPopulated ? otherUser.name : "User",
                    email: hasPopulated ? otherUser.email : "",
                    avatar: (hasPopulated && otherUser.name ? otherUser.name : "U").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                    profilePicture: hasPopulated ? otherUser.profilePicture : null,
                    lastMessage: msg.content || (msg.file ? "Sent a file" : ""),
                    time: msg.createdAt,
                    unread: 0,
                    status: 'online',
                    isBlocked: currentUser.blockedUsers && currentUser.blockedUsers.includes(otherUserId),
                    isPinned,
                    isMuted,
                    isMarkedUnread
                });
            }

            // Count unread if I am the receiver and status is not 'read'
            if (receiverId === myId.toString() && msg.status !== 'read') {
                conversationsMap.get(otherUserId).unread += 1;
            }
        });

        // Loop again to adjust unread count if marked unread manually
        for (let [id, val] of conversationsMap) {
            if (val.isMarkedUnread && val.unread === 0) {
                val.unread = 1; // Force visual indicator
            }
        }

        const conversations = Array.from(conversationsMap.values()).sort((a, b) => {
            // Pinned first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then logic: recent message time
            return new Date(b.time) - new Date(a.time);
        });
        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.body;
        const myId = req.user._id;

        await Message.updateMany(
            { sender: senderId, receiver: myId, status: { $ne: 'read' } },
            { $set: { status: 'read' } }
        );

        res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Clear chat history for user
export const clearChat = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        await User.findByIdAndUpdate(myId, {
            $pull: { deletedChats: { userId } }
        });

        await User.findByIdAndUpdate(myId, {
            $push: { deletedChats: { userId, deletedAt: new Date() } }
        });

        res.status(200).json({ success: true, message: "Chat history cleared" });
    } catch (error) {
        console.error("Error clearing chat:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete chat (hide from list)
export const deleteChat = async (req, res) => {
    // In this simple implementation, clear and delete do the same (hide history)
    return clearChat(req, res);
};

// Block user
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const myId = req.user._id;

        await User.findByIdAndUpdate(myId, {
            $addToSet: { blockedUsers: userId }
        });

        res.status(200).json({ success: true, message: "User blocked" });
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Unblock user
export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const myId = req.user._id;

        await User.findByIdAndUpdate(myId, {
            $pull: { blockedUsers: userId }
        });

        res.status(200).json({ success: true, message: "User unblocked" });
    } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Toggle Pin Chat
export const togglePin = async (req, res) => {
    try {
        const { userId } = req.body;
        const myId = req.user._id;
        const user = await User.findById(myId);

        let action = 'pinned';
        if (user.pinnedChats && user.pinnedChats.includes(userId)) {
            await User.findByIdAndUpdate(myId, { $pull: { pinnedChats: userId } });
            action = 'unpinned';
        } else {
            await User.findByIdAndUpdate(myId, { $addToSet: { pinnedChats: userId } });
        }
        res.status(200).json({ success: true, message: `Chat ${action}`, action });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error" });
    }
};

// Toggle Mute Chat
export const toggleMute = async (req, res) => {
    try {
        const { userId } = req.body;
        const myId = req.user._id;
        const user = await User.findById(myId);

        let action = 'muted';
        if (user.mutedChats && user.mutedChats.includes(userId)) {
            await User.findByIdAndUpdate(myId, { $pull: { mutedChats: userId } });
            action = 'unmuted';
        } else {
            await User.findByIdAndUpdate(myId, { $addToSet: { mutedChats: userId } });
        }
        res.status(200).json({ success: true, message: `Chat ${action}`, action });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error" });
    }
};

// Toggle Unread
export const toggleUnread = async (req, res) => {
    try {
        const { userId } = req.body; // chat user id
        const myId = req.user._id;
        const user = await User.findById(myId);

        let action = 'unread';
        if (user.markedUnreadChats && user.markedUnreadChats.includes(userId)) {
            // Mark as Read (remove from unread list AND essentially call markMessagesAsRead)
            await User.findByIdAndUpdate(myId, { $pull: { markedUnreadChats: userId } });
            // Also update actual messages
            await Message.updateMany(
                { sender: userId, receiver: myId, status: { $ne: 'read' } },
                { $set: { status: 'read' } }
            );
            action = 'read';
        } else {
            // Mark as unread
            await User.findByIdAndUpdate(myId, { $addToSet: { markedUnreadChats: userId } });
        }
        res.status(200).json({ success: true, message: `Marked as ${action}`, action });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error" });
    }
};
