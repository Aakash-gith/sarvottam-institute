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
    toggleUnread
} from '../controllers/message.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
// All routes are protected
router.use(authMiddleware);

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

export default router;
