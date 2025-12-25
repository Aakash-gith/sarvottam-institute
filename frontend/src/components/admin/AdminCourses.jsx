import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { toast } from "react-hot-toast";
import {
    Layers,
    Plus,
    Video,
    Users,
    Edit,
    Trash2,
    Check,
    X,
    Calendar,
    Clock,
    DollarSign,
    BookOpen
} from "lucide-react";

// Modal for Creating/Editing Course
const CourseModal = ({ isOpen, onClose, course, onSave }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        studentLimit: 50,
        thumbnail: "",
        features: "",
        hasCertificate: true,
        isFreeTrialAvailable: false
    });

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                description: course.description,
                price: course.price,
                studentLimit: course.studentLimit,
                thumbnail: course.thumbnail || "",
                features: course.features ? course.features.join("\n") : "",
                hasCertificate: course.hasCertificate,
                isFreeTrialAvailable: course.isFreeTrialAvailable
            });
        } else {
            setFormData({
                title: "",
                description: "",
                price: 0,
                studentLimit: 50,
                thumbnail: "",
                features: "",
                hasCertificate: true,
                isFreeTrialAvailable: false
            });
        }
    }, [course, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const featuresArray = formData.features.split("\n").filter(f => f.trim() !== "");
        onSave({
            ...formData,
            features: featuresArray
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                    {course ? "Edit Course" : "Create New Course"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            required
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                required
                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Limit</label>
                            <input
                                type="number"
                                name="studentLimit"
                                value={formData.studentLimit}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thumbnail URL</label>
                        <input
                            type="text"
                            name="thumbnail"
                            value={formData.thumbnail}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Features (One per line)</label>
                        <textarea
                            name="features"
                            value={formData.features}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Live Classes&#10;Study Materials&#10;Certificate"
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="hasCertificate"
                                checked={formData.hasCertificate}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Includes Certificate</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isFreeTrialAvailable"
                                checked={formData.isFreeTrialAvailable}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Free Trial Available</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {course ? "Update Course" : "Create Course"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal for Scheduling Class
const ScheduleClassModal = ({ isOpen, onClose, courseId, onSchedule }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        durationMinutes: 60,
        isDemo: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const startTime = new Date(`${formData.date}T${formData.time}`);
        onSchedule({
            courseId,
            title: formData.title,
            description: formData.description,
            startTime,
            durationMinutes: parseInt(formData.durationMinutes),
            isDemo: formData.isDemo
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Schedule Live Class</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
                        <input
                            type="number"
                            name="durationMinutes"
                            value={formData.durationMinutes}
                            onChange={handleChange}
                            min="15"
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isDemo"
                                checked={formData.isDemo}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">Is Demo Class? (Free for everyone)</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Schedule Class
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Selecting course for management
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseClasses, setCourseClasses] = useState([]);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);


    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await API.get("/courses"); // Assuming admin can read from same endpoint or similar
            setCourses(response.data);
        } catch (error) {
            toast.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (courseData) => {
        try {
            if (editingCourse) {
                await API.put(`/courses/${editingCourse._id}`, courseData);
                toast.success("Course updated successfully");
            } else {
                await API.post("/courses", courseData);
                toast.success("Course created successfully");
            }
            setIsCourseModalOpen(false);
            setEditingCourse(null);
            fetchCourses();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save course");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await API.delete(`/courses/${id}`);
            toast.success("Course deleted");
            fetchCourses();
        } catch (error) {
            toast.error("Failed to delete course");
        }
    };

    const openManagement = async (course) => {
        setSelectedCourse(course);
        // Fetch classes for this course
        try {
            const res = await API.get(`/live-classes/course/${course._id}`);
            setCourseClasses(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Could not fetch classes");
        }
    };

    const handleScheduleClass = async (classData) => {
        try {
            await API.post("/live-classes/schedule", classData);
            toast.success("Class scheduled successfully");
            setIsClassModalOpen(false);
            // Refresh classes
            if (selectedCourse) {
                const res = await API.get(`/live-classes/course/${selectedCourse._id}`);
                setCourseClasses(res.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule class");
        }
    }

    if (selectedCourse) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedCourse(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                >
                    <X size={20} /> Back to Courses
                </button>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedCourse.title}</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">{selectedCourse.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                {selectedCourse.enrolledStudents?.length || 0} Students Enrolled
                            </span>
                            <span className="font-mono text-slate-500">Limits: {selectedCourse.studentLimit}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Video className="text-red-500" /> Live Classes
                        </h3>
                        <button
                            onClick={() => setIsClassModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Plus size={18} /> Schedule Class
                        </button>
                    </div>

                    <div className="space-y-3">
                        {courseClasses.length > 0 ? (
                            courseClasses.map(cls => (
                                <div key={cls._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                            <Video size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{cls.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(cls.startTime).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Clock size={14} /> {new Date(cls.startTime).toLocaleTimeString()} ({cls.durationMinutes} min)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {cls.status === 'live' && <span className="bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse">LIVE</span>}
                                        {cls.status === 'completed' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Completed</span>}
                                        {cls.status === 'scheduled' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Scheduled</span>}

                                        {/* Join as Host Button (Future) */}
                                        <button
                                            onClick={() => window.open(`/live-class/${cls._id}/host`, '_blank')}
                                            className="text-blue-600 hover:underline text-sm font-semibold"
                                        >
                                            Join as Host
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                No classes scheduled yet.
                            </div>
                        )}
                    </div>
                </div>

                <ScheduleClassModal
                    isOpen={isClassModalOpen}
                    onClose={() => setIsClassModalOpen(false)}
                    courseId={selectedCourse._id}
                    onSchedule={handleScheduleClass}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Courses</h2>
                <button
                    onClick={() => {
                        setEditingCourse(null);
                        setIsCourseModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg"
                >
                    <Plus size={20} /> Create New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="h-40 bg-slate-200 dark:bg-slate-800 relative">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Layers size={48} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingCourse(course);
                                        setIsCourseModalOpen(true);
                                    }}
                                    className="p-2 bg-white/90 text-slate-700 rounded-lg hover:text-blue-600"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course._id)}
                                    className="p-2 bg-white/90 text-slate-700 rounded-lg hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                            <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                                <span className="flex items-center gap-1"><Users size={16} /> {course.enrolledStudents?.length}/{course.studentLimit}</span>
                                <span className="flex items-center gap-1"><DollarSign size={16} /> {course.price}</span>
                            </div>

                            <button
                                onClick={() => openManagement(course)}
                                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
                            >
                                Manage & Schedule
                            </button>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No courses found. Create one to get started.
                    </div>
                )}
            </div>

            <CourseModal
                isOpen={isCourseModalOpen} // Fixed prop name
                onClose={() => setIsCourseModalOpen(false)}
                course={editingCourse}
                onSave={handleCreateCourse}
            />
        </div>
    );
};

export default AdminCourses;
