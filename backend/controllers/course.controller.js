
import Course from '../models/Course.js';
import User from '../models/Users.js';

// Create a new course
export const createCourse = async (req, res) => {
    try {
        const { title, description, price, studentLimit, features, hasCertificate } = req.body;

        // Check if user is admin (assuming middleware sets req.user.role or similar checks, 
        // but here we just check if the user exists and maybe restrict by role later or in route middleware)
        // Providing basic creation logic for now. Use req.user._id as instructor if admin

        const newCourse = new Course({
            title,
            description,
            instructor: req.user._id, // Assumes auth middleware populates req.user
            price,
            studentLimit,
            features,
            hasCertificate
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
};

// Get all courses (with optional status filter)
export const getCourses = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const courses = await Course.find(query).populate('instructor', 'name email');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).populate('instructor', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
};

// Enroll a student in a course
export const enrollStudent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.enrolledStudents.includes(userId)) {
            return res.status(400).json({ message: 'Student already enrolled' });
        }

        if (course.enrolledStudents.length >= course.studentLimit) {
            return res.status(400).json({ message: 'Course is full' });
        }

        // Add student to course
        course.enrolledStudents.push(userId);
        await course.save();

        res.status(200).json({ message: 'Enrolled successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling student', error: error.message });
    }
};

// Update course details
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const course = await Course.findByIdAndUpdate(id, updates, { new: true });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
};

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
};

// Generate Certificate (Placeholder)
export const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check completion (this logic would require tracking progress, which we haven't fully implemented for live classes)
        // For now, checks if enrolled.
        if (!course.enrolledStudents.includes(userId)) {
            return res.status(403).json({ message: 'Not enrolled' });
        }

        // TODO: Implement PDF generation (e.g. using pdfkit)
        // For now return a success signal
        res.status(200).json({
            message: 'Certificate generated successfully',
            certificateUrl: `https://api.sarvottam-institute.in/certificates/${courseId}_${userId}.pdf` // Mock URL
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating certificate', error: error.message });
    }
};
