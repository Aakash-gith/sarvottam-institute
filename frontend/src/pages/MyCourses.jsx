import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Loader, BookOpen, Clock, Lock, PlayCircle, Calendar, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { toast } from "react-hot-toast";

const MyCourses = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all', 'active', 'expired'

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const res = await API.get("/courses/my-enrollments");
            setEnrollments(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your courses");
        } finally {
            setLoading(false);
        }
    };

    const getDaysLeft = (expiryDate) => {
        const diff = new Date(expiryDate) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    const filteredEnrollments = enrollments.filter(enrollment => {
        const expired = isExpired(enrollment.expiresAt);
        if (filter === "active") return !expired;
        if (filter === "expired") return expired;
        return true;
    });

    return (
        <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 transition-all duration-300 ml-0 md:ml-[120px]">
                <div className="max-w-7xl mx-auto p-6 md:p-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Batches</h1>
                            <p className="text-slate-500 mt-2">Continue learning where you left off</p>
                        </div>

                        {/* Filters */}
                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            {['all', 'active', 'expired'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filter === f
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : filteredEnrollments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
                                <BookOpen size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {filter === 'all' ? "You haven't enrolled in any courses yet" : `No ${filter} courses found`}
                            </h3>
                            <a href="/courses" className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                                Explore Courses
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredEnrollments.map((item) => {
                                const { course, expiresAt } = item;
                                const expired = isExpired(expiresAt);
                                const daysLeft = getDaysLeft(expiresAt);
                                const isNew = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24) < 3; // Enrolled < 3 days ago

                                return (
                                    <div
                                        key={item._id}
                                        className={`group bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border transition-all duration-300 flex flex-col md:flex-row gap-6 ${expired
                                            ? 'border-slate-200 dark:border-slate-700 opacity-75 grayscale-[0.5]'
                                            : 'border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900'
                                            }`}
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden relative shrink-0">
                                            {course.thumbnail ? (
                                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                    <BookOpen size={32} />
                                                </div>
                                            )}
                                            {isNew && !expired && (
                                                <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">
                                                    New
                                                </span>
                                            )}
                                            {expired && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Lock className="text-white w-10 h-10" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 mb-2">
                                                <div>
                                                    <div className="flex gap-2 mb-2">
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                                            {course.classLevel || 'Class 10'}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                            {course.subject || 'All'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                                        {course.title}
                                                    </h3>
                                                </div>

                                                {/* Validity Badge */}
                                                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${expired
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : daysLeft < 30
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    <Clock size={14} />
                                                    {expired
                                                        ? `Expired on ${new Date(expiresAt).toLocaleDateString()}`
                                                        : `Valid till ${new Date(expiresAt).toLocaleDateString()}`
                                                    }
                                                </div>
                                            </div>

                                            {/* Progress (Mock Data for now as live progress isn't full tracked) */}
                                            {/* <div className="mt-2 mb-4">
                                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                    <span>Progress</span>
                                                    <span>35%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 w-[35%] rounded-full" />
                                                </div>
                                            </div> */}

                                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Calendar size={16} />
                                                    <span>Enrolled: {new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                <button
                                                    disabled={expired}
                                                    onClick={() => !expired && navigate(`/course/${course._id}/learn`)}
                                                    className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition ${expired
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                                                        }`}
                                                >
                                                    {expired ? (
                                                        <>Course Expired</>
                                                    ) : (
                                                        <>
                                                            <PlayCircle size={20} /> Continue Learning
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyCourses;
