
import express from 'express';
import {
    createCourse,
    getCourses,
    getCourseById,
    enrollStudent,
    updateCourse,
    deleteCourse,
    generateCertificate,
    getMyEnrollments
} from '../controllers/course.controller.js';
import { updateContentProgress, getCourseProgress } from '../controllers/courseProgress.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
// import adminMiddleware from '../middleware/admin.middleware.js'; // If exists

const router = express.Router();

// Protected routes
router.get('/my-enrollments', authMiddleware, getMyEnrollments);
router.post('/progress', authMiddleware, updateContentProgress); // Consolidated update endpoint
router.get('/:courseId/progress', authMiddleware, getCourseProgress);

router.post('/', authMiddleware, createCourse); // Should be admin/instructor only
router.post('/:courseId/enroll', authMiddleware, enrollStudent);
router.get('/:courseId/certificate', authMiddleware, generateCertificate);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

// Public routes (or partially public? Courses usually visible to all)
router.get('/', getCourses);
router.get('/:id', getCourseById);

export default router;
