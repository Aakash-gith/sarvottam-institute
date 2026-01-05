import express from 'express';
import {
    sendMessage,
    getMessages,
    markMessagesAsRead,
    getConversations,
    clearChat,
    deleteChat,
    blockUser,
    unblockUser,
    togglePin,
    toggleMute,
    toggleUnread,
    createGroup,
    markAllAsRead,
    clearAllConversations
} from '../controllers/message.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
router.use((req, res, next) => {
    console.log(`[MESSAGE ROUTE] ${req.method} ${req.path}`);
    next();
});

// All routes are protected
router.use(authMiddleware);

router.post('/create-group', createGroup);
router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.put('/read', markMessagesAsRead);
router.delete('/clear/:userId', clearChat);
router.delete('/delete/:userId', deleteChat);
router.post('/block', blockUser);
router.post('/unblock', unblockUser);
router.post('/pin', togglePin);
router.post('/mute', toggleMute);
router.post('/toggle-unread', toggleUnread);
router.put('/read-all', markAllAsRead);
router.delete('/clear-all', clearAllConversations);

export default router;
