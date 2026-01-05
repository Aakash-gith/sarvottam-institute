import Message from '../models/Message.js';
import User from '../models/Users.js';
import Group from '../models/Group.js';

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, members, avatar } = req.body;
        const creatorId = req.user._id;

        if (!name || !members || !Array.isArray(members)) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const allMembers = [...new Set([...members, creatorId.toString()])];

        const newGroup = new Group({
            name,
            description,
            members: allMembers,
            admins: [creatorId],
            createdBy: creatorId,
            avatar
        });
        const savedGroup = await newGroup.save();

        try {
            // Create an initial system message
            const systemMessage = new Message({
                sender: creatorId,
                groupReceiver: savedGroup._id,
                content: `Group "${name}" created`,
                conversationType: 'group',
                status: 'sent'
            });
            await systemMessage.save();
        } catch (msgError) {
            console.error("System message failed but group was created:", msgError);
        }

        res.status(201).json({ success: true, data: savedGroup });
    } catch (error) {
        console.error("Error creating group - FULL DETAILS:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, groupId, content, file } = req.body;
        const senderId = req.user._id;

        if (!receiverId && !groupId) {
            return res.status(400).json({ success: false, message: "Missing recipient" });
        }

        if (receiverId) {
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
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId || undefined,
            groupReceiver: groupId || undefined,
            conversationType: groupId ? 'group' : 'direct',
            content,
            file: file ? {
                url: file.url,
                fileType: file.type || 'file',
                name: file.name
            } : undefined,
            status: 'sent'
        });

        const savedMessage = await newMessage.save();
        res.status(201).json({ success: true, data: savedMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get conversation with a specific user
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params; // or groupId
        const { type } = req.query; // 'direct' or 'group'
        const myId = req.user._id;

        const currentUser = await User.findById(myId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let query = {};
        if (type === 'group') {
            query = { groupReceiver: userId, conversationType: 'group' };
        } else {
            const deletionInfo = currentUser.deletedChats?.find(d => d.userId.toString() === userId.toString());
            const deleteThreshold = deletionInfo ? deletionInfo.deletedAt : new Date(0);
            query = {
                $or: [
                    { sender: myId, receiver: userId },
                    { sender: userId, receiver: myId }
                ],
                createdAt: { $gt: deleteThreshold },
                conversationType: 'direct'
            };
        }

        const messages = await Message.find(query).sort({ createdAt: 1 }).populate('sender', 'name profilePicture');

        // Mark unread as read if direct
        if (type !== 'group') {
            const unreadMsgIds = messages
                .filter(msg => msg.sender?._id.toString() === userId.toString() && msg.status !== 'read')
                .map(msg => msg._id);

            if (unreadMsgIds.length > 0) {
                await Message.updateMany(
                    { _id: { $in: unreadMsgIds } },
                    { $set: { status: 'read' } }
                );
            }
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

        // Fetch user context for pins/mutes/deletions
        const currentUser = await User.findById(myId);
        if (!currentUser) return res.status(404).json({ success: false, message: "User not found" });

        // 1. Direct Conversations
        const directMessages = await Message.find({
            $or: [{ sender: myId, conversationType: 'direct' }, { receiver: myId, conversationType: 'direct' }]
        })
            .sort({ createdAt: -1 })
            .populate('sender receiver', 'name email profilePicture');

        const conversationsMap = new Map();

        directMessages.forEach(msg => {
            const senderId = (msg.sender?._id || msg.sender)?.toString();
            const receiverId = (msg.receiver?._id || msg.receiver)?.toString();
            if (!senderId || !receiverId) return;

            const isMeSender = senderId === myId.toString();
            const otherUserId = isMeSender ? receiverId : senderId;
            const otherUser = isMeSender ? msg.receiver : msg.sender;

            // Deletion check
            const deletionInfo = currentUser.deletedChats ? currentUser.deletedChats.find(d => d.userId.toString() === otherUserId) : null;
            if (deletionInfo && msg.createdAt <= deletionInfo.deletedAt) return;

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    id: otherUserId,
                    type: 'direct',
                    name: otherUser?.name || "User",
                    profilePicture: otherUser?.profilePicture || null,
                    lastMessage: msg.content || (msg.file ? "Sent a file" : ""),
                    time: msg.createdAt,
                    unread: 0,
                    isPinned: currentUser.pinnedChats?.includes(otherUserId),
                    isMuted: currentUser.mutedChats?.includes(otherUserId),
                    isMarkedUnread: currentUser.markedUnreadChats?.includes(otherUserId)
                });
            }
            if (receiverId === myId.toString() && msg.status !== 'read') {
                conversationsMap.get(otherUserId).unread += 1;
            }
        });

        // 2. Group Conversations
        const userGroups = await Group.find({ members: myId });
        const groupConversations = await Promise.all(userGroups.map(async (group) => {
            const lastMsg = await Message.findOne({ groupReceiver: group._id, conversationType: 'group' })
                .sort({ createdAt: -1 })
                .populate('sender', 'name');

            return {
                id: group._id,
                type: 'group',
                name: group.name,
                profilePicture: group.avatar,
                lastMessage: lastMsg ? `${lastMsg.sender?.name}: ${lastMsg.content || "Sent a file"}` : "No messages yet",
                time: lastMsg ? lastMsg.createdAt : group.createdAt,
                unread: 0, // Simplified unread for groups for now
                isPinned: false,
                isMuted: false,
                membersCount: group.members.length
            };
        }));

        // Merge and sort
        const conversations = [...Array.from(conversationsMap.values()), ...groupConversations].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
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

// Mark ALL messages as read
export const markAllAsRead = async (req, res) => {
    try {
        const myId = req.user._id;
        await Message.updateMany(
            { receiver: myId, status: { $ne: 'read' } },
            { $set: { status: 'read' } }
        );
        await User.findByIdAndUpdate(myId, { $set: { markedUnreadChats: [] } });
        res.status(200).json({ success: true, message: "All messages marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error" });
    }
};

// Clear ALL conversations
export const clearAllConversations = async (req, res) => {
    try {
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }]
        });

        const otherUserIds = [...new Set(messages.map(m =>
            m.sender.toString() === myId.toString() ? m.receiver?.toString() : m.sender.toString()
        ))].filter(id => id);

        const now = new Date();
        const deletions = otherUserIds.map(userId => ({ userId, deletedAt: now }));

        await User.findByIdAndUpdate(myId, {
            $set: { deletedChats: deletions }
        });

        res.status(200).json({ success: true, message: "All conversations cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error" });
    }
};
