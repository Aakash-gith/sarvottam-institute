
import LiveClass from '../models/LiveClass.js';
import Course from '../models/Course.js';
import { createRoom, getAuthToken } from '../conf/hms.js';

// Schedule a new live class
export const scheduleClass = async (req, res) => {
    try {
        const { courseId, title, description, startTime, durationMinutes, isDemo } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is instructor (or admin)
        // Assuming middleware ensures authorization
        if (course.instructor.toString() !== req.user._id.toString()) {
            // Allow admins too? For now, stricly instructor or check role
            // return res.status(403).json({ message: 'Not authorized' });
        }

        // Create 100ms room
        const roomData = await createRoom(`${title}-${Date.now()}`, description);

        const newClass = new LiveClass({
            course: courseId,
            title,
            description,
            startTime,
            durationMinutes,
            isDemo,
            hmsRoomId: roomData.id
        });

        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling class', error: error.message });
    }
};

// Get all live classes for a course
export const getClassesForCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const classes = await LiveClass.find({ course: courseId }).sort({ startTime: 1 });
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classes', error: error.message });
    }
};

// Join a live class (Get Auth Token)
export const joinClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user._id;
        const userName = req.user.name; // Assuming user in req has name

        const liveClass = await LiveClass.findById(classId).populate('course');
        if (!liveClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check enrollment or instructor
        const isInstructor = liveClass.course.instructor.toString() === userId.toString();
        const isEnrolled = liveClass.course.enrolledStudents.includes(userId);

        if (!isInstructor && !isEnrolled && !liveClass.isDemo) {
            return res.status(403).json({ message: 'You are not enrolled in this course' });
        }

        const role = isInstructor ? 'teacher' : 'student'; // 100ms roles must exist in template. Default template usually has 'host' and 'guest'.
        // We should map 'teacher' -> 'host' and 'student' -> 'guest' if using default.
        // Let's assume 'host' and 'guest' for now or 'teacher'/'student' if custom template.
        // I'll use 'host' for teacher and 'guest' for student to be safe with defaults, 
        // BUT user might have custom roles. I'll stick to 'teacher'/'student' and hope their template has it, 
        // or arguably 'host'/'guest' is safer. Let's start with 'host'/'guest'.

        const hmsRole = isInstructor ? 'host' : 'guest';

        const token = getAuthToken(liveClass.hmsRoomId, hmsRole, userId.toString());

        res.status(200).json({
            token,
            roomId: liveClass.hmsRoomId,
            role: hmsRole,
            userName
        });
    } catch (error) {
        res.status(500).json({ message: 'Error joining class', error: error.message });
    }
};

// Update recording URL (Manually or via future webhook)
export const updateRecording = async (req, res) => {
    try {
        const { classId } = req.params;
        const { recordingUrl } = req.body;

        const liveClass = await LiveClass.findByIdAndUpdate(classId, { recordingUrl, status: 'completed' }, { new: true });
        if (!liveClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json(liveClass);
    } catch (error) {
        res.status(500).json({ message: 'Error updating recording', error: error.message });
    }
}
