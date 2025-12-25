
import express from 'express';
import {
    scheduleClass,
    getClassesForCourse,
    joinClass,
    updateRecording
} from '../controllers/liveClass.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/schedule', authMiddleware, scheduleClass);
router.get('/course/:courseId', authMiddleware, getClassesForCourse); // Can be public if listing? usually protected.
router.get('/:classId/join', authMiddleware, joinClass);
router.put('/:classId/recording', authMiddleware, updateRecording); // Admin only ideal

export default router;
