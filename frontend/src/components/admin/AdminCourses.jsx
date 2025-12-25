import React, { useState, useEffect, useRef } from "react";
import API from "../../api/axios";
import { toast } from "react-hot-toast";
import {
    Layers, Plus, Video, Users, Edit, Trash2, Check, X, Calendar, Clock, DollarSign, Upload, Image as ImageIcon, BookOpen, Search, ArrowLeft
} from "lucide-react";

// --- Course Modal with File Upload & Enhanced Fields ---
const CourseModal = ({ isOpen, onClose, course, onSave }) => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        studentLimit: 1000,
        thumbnail: "",
        features: "",
        hasCertificate: true,
        isFreeTrialAvailable: false,
        classLevel: "Class 10",
        subject: "All",
        validityMode: "days",
        validityValue: "365",
        status: "draft"
    });

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || "",
                description: course.description || "",
                price: course.price || 0,
                studentLimit: course.studentLimit || 1000,
                thumbnail: course.thumbnail || "",
                features: course.features ? course.features.join("\n") : "",
                hasCertificate: course.hasCertificate ?? true,
                isFreeTrialAvailable: course.isFreeTrialAvailable ?? false,
                classLevel: course.classLevel || "Class 10",
                subject: course.subject || "All",
                validityMode: course.validityMode || "days",
                validityValue: course.validityValue || "365",
                status: course.status || "draft"
            });
            setPreviewUrl(course.thumbnail || "");
        } else {
            // Reset default
            setFormData({
                title: "",
                description: "",
                price: 0,
                studentLimit: 1000,
                thumbnail: "",
                features: "",
                hasCertificate: true,
                isFreeTrialAvailable: false,
                classLevel: "Class 10",
                subject: "All",
                validityMode: "days",
                validityValue: "365",
                status: "draft"
            });
            setPreviewUrl("");
        }
    }, [course, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Local Preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Upload immediately
        const uploadData = new FormData();
        uploadData.append('thumbnail', file);

        try {
            setUploading(true);
            const res = await API.post("/upload/upload", uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setFormData(prev => ({ ...prev, thumbnail: res.data.url }));
                toast.success("Image uploaded!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const featuresArray = formData.features.split("\n").filter(f => f.trim() !== "");

        await onSave({
            ...formData,
            features: featuresArray
        });
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {course ? "Edit Course" : "Create New Course"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Left Column: Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 border-slate-200 dark:border-slate-700">Basic Info</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required
                                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Master Class 10 Physics" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required
                                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Detailed description..." />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 border-slate-200 dark:border-slate-700">Categorization</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Class Level</label>
                                        <div className="flex gap-4">
                                            {['Class 9', 'Class 10'].map(cls => (
                                                <label key={cls} className={`flex-1 cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.classLevel === cls ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                    <input type="radio" name="classLevel" value={cls} checked={formData.classLevel === cls} onChange={handleChange} className="hidden" />
                                                    <span className="font-bold">{cls}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                                        <select name="subject" value={formData.subject} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                            <option value="All">All Subjects</option>
                                            <option value="Maths">Mathematics</option>
                                            <option value="Science">Science</option>
                                            <option value="English">English</option>
                                            <option value="Social Science">Social Science</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 border-slate-200 dark:border-slate-700">Course Status</h3>
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Publish Status</span>
                                    <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                        {['draft', 'published'].map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, status }))}
                                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${formData.status === status ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings & Media */}
                        <div className="space-y-6">

                            {/* Thumbnail Upload */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 border-slate-200 dark:border-slate-700">Thumbnail</h3>
                                <div
                                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer relative overflow-hidden group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                                <span className="text-white font-medium flex items-center gap-2"><Edit size={16} /> Change Image</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                                <Upload size={24} />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload thumbnail</p>
                                            <p className="text-xs text-slate-500">JPG, PNG, WEBP</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 border-slate-200 dark:border-slate-700">Pricing & Validity</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                                            <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required
                                                className="w-full pl-8 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Limit</label>
                                        <input type="number" name="studentLimit" value={formData.studentLimit} onChange={handleChange} min="1" required
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Validity Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="validityMode" value="days" checked={formData.validityMode === 'days'} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" />
                                                <span className="text-slate-700 dark:text-slate-300">Days from Purchase</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="validityMode" value="date" checked={formData.validityMode === 'date'} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" />
                                                <span className="text-slate-700 dark:text-slate-300">Fixed Expiry Date</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            {formData.validityMode === 'days' ? 'Number of Days' : 'Expiry Date'}
                                        </label>
                                        {formData.validityMode === 'days' ? (
                                            <input type="number" name="validityValue" value={formData.validityValue} onChange={handleChange} placeholder="e.g. 365" required
                                                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                        ) : (
                                            <input type="date" name="validityValue" value={formData.validityValue} onChange={handleChange} required
                                                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                        )}
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formData.validityMode === 'days' ? "Validity starts from the moment user purchases." : "Course access will end on this date for all users."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 border-slate-200 dark:border-slate-700">Features</h3>
                                <textarea name="features" value={formData.features} onChange={handleChange} rows={3} placeholder="Live Classes&#10;Doubt Sessions&#10;PDF Notes"
                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-semibold">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading || uploading} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                        {course ? "Update Course" : "Create Course"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... ScheduleClassModal remains largely same, just condensing for brevity in this replace ...
const ScheduleClassModal = ({ isOpen, onClose, courseId, onSchedule }) => {
    const [formData, setFormData] = useState({ title: "", description: "", date: "", time: "", durationMinutes: 60, isDemo: false });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSchedule({
            courseId,
            title: formData.title,
            description: formData.description,
            startTime: new Date(`${formData.date}T${formData.time}`),
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
                    <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded" required />
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded" />
                    <div className="flex gap-2">
                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded" required />
                        <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full p-2 border rounded" required />
                    </div>
                    <input type="number" placeholder="Duration (min)" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} className="w-full p-2 border rounded" />
                    <label className="flex gap-2"><input type="checkbox" checked={formData.isDemo} onChange={e => setFormData({ ...formData, isDemo: e.target.checked })} /> Demo Class?</label>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Schedule</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminCourses = () => {
    const [viewMode, setViewMode] = useState('classes'); // classes | courses
    const [selectedClass, setSelectedClass] = useState(null); // 'Class 9' | 'Class 10'
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [selectedCourseForManage, setSelectedCourseForManage] = useState(null); // For Schedule view
    const [courseClasses, setCourseClasses] = useState([]);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);


    useEffect(() => {
        if (selectedClass) {
            fetchCourses(selectedClass);
        }
    }, [selectedClass]);

    const fetchCourses = async (classLevel) => {
        try {
            setLoading(true);
            const response = await API.get(`/courses?classLevel=${classLevel}`);
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
            fetchCourses(selectedClass || 'Class 10');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save course");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await API.delete(`/courses/${id}`);
            toast.success("Course deleted");
            fetchCourses(selectedClass);
        } catch (error) {
            toast.error("Failed to delete course");
        }
    };

    // Management Logic
    const openManagement = async (course) => {
        setSelectedCourseForManage(course);
        try {
            const res = await API.get(`/live-classes/course/${course._id}`);
            setCourseClasses(res.data);
        } catch (error) {
            toast.error("Could not fetch classes");
        }
    };

    const handleScheduleClass = async (classData) => {
        try {
            await API.post("/live-classes/schedule", classData);
            toast.success("Class scheduled successfully");
            setIsClassModalOpen(false);
            if (selectedCourseForManage) {
                const res = await API.get(`/live-classes/course/${selectedCourseForManage._id}`);
                setCourseClasses(res.data);
            }
        } catch (error) {
            toast.error("Failed to schedule class");
        }
    };


    // RENDER: Detailed Course Management (Scheduling)
    if (selectedCourseForManage) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <button onClick={() => setSelectedCourseForManage(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                    <ArrowLeft size={20} /> Back to {selectedClass} Courses
                </button>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedCourseForManage.title}</h2>
                            <div className="flex gap-3">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium">{selectedCourseForManage.subject}</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{selectedCourseForManage.status}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsClassModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center gap-2">
                            <Plus size={20} /> Schedule Live Class
                        </button>
                    </div>
                    {/* Class List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Scheduled Classes</h3>
                        {courseClasses.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500">No live classes scheduled yet.</p>
                            </div>
                        ) : (
                            courseClasses.map(cls => (
                                <div key={cls._id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-lg"><Video size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{cls.title}</h4>
                                            <p className="text-sm text-slate-500 flex gap-4 mt-1">
                                                <span>{new Date(cls.startTime).toLocaleDateString()}</span>
                                                <span>{new Date(cls.startTime).toLocaleTimeString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <a href={`/live-class/${cls._id}/host`} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">Join as Host</a>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <ScheduleClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} courseId={selectedCourseForManage._id} onSchedule={handleScheduleClass} />
            </div>
        );
    }

    // RENDER: Course List for Selected Class
    if (viewMode === 'courses' && selectedClass) {
        return (
            <div className="space-y-8 animate-in float-in-from-bottom duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setViewMode('classes'); setSelectedClass(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                            <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedClass} Batches</h2>
                            <p className="text-slate-500 text-sm">Manage courses for {selectedClass}</p>
                        </div>
                    </div>
                    <button onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center gap-2">
                        <Plus size={20} /> Create New Batch
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading courses...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Batches Found</h3>
                                <p className="text-slate-500">Create a new batch to get started.</p>
                            </div>
                        ) : (
                            courses.map(course => (
                                <div key={course._id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group flex flex-col">
                                    {/* Thumbnail */}
                                    <div className="h-48 relative bg-slate-100 dark:bg-slate-800">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon size={48} /></div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${course.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                {course.status}
                                            </span>
                                        </div>
                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition duration-200">
                                            <button onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }} className="p-2 bg-white text-slate-900 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"><Edit size={20} /></button>
                                            <button onClick={() => handleDeleteCourse(course._id)} className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 size={20} /></button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded uppercase tracking-wider">{course.subject}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{course.title}</h3>
                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Users size={16} /> {course.enrolledStudents?.length || 0} Students</span>
                                            <button onClick={() => openManagement(course)} className="text-blue-600 font-semibold hover:underline">Manage</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <CourseModal
                    isOpen={isCourseModalOpen}
                    onClose={() => setIsCourseModalOpen(false)}
                    course={editingCourse}
                    onSave={handleCreateCourse}
                />
            </div>
        );
    }

    // RENDER: Default - Class Selection
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Course Management</h1>
                <p className="text-slate-500 mt-2">Select a class to manage its batches and content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                {['Class 9', 'Class 10'].map((cls, idx) => (
                    <div
                        key={cls}
                        onClick={() => { setSelectedClass(cls); setViewMode('courses'); }}
                        className={`group relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`}
                    >
                        <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10 transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-blue-600' : 'bg-purple-600'}`} />

                        <div className="relative z-10">
                            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{cls}</h2>
                            <p className="text-slate-500 font-medium">Manage Batches & Resources</p>

                            <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                                <span>View Batches</span>
                                <ArrowLeft size={20} className="rotate-180" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCourses;
