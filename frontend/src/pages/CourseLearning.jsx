import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getCourseProgress, updateProgress } from '../api/courses';
import { Loader, PlayCircle, FileText, Video, List, Clock, ChevronRight, HelpCircle, ArrowLeft, BookOpen, Layers, Award, BarChart2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseLearning = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('recorded');
    const [expandedSubjects, setExpandedSubjects] = useState({});

    // Navigation State for Card Flow
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);

    // Fetch Course Data & Progress
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseData, progressRes] = await Promise.all([
                    getCourseById(courseId),
                    getCourseProgress(courseId)
                ]);

                setCourse(courseData);
                setProgressData(progressRes);

                if (courseData.curriculum) {
                    const initialExpanded = {};
                    courseData.curriculum.forEach((_, idx) => initialExpanded[idx] = true);
                    setExpandedSubjects(initialExpanded);
                }
            } catch (error) {
                console.error("Failed to load course", error);
                toast.error("Failed to load course content");
                navigate('/my-courses');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, navigate]);

    // Handle Content Completion
    const handleContentClick = async (content) => {
        if (content.url) window.open(content.url, '_blank');

        // Mark as complete if not already
        const isCompleted = progressData?.completedContents?.some(c => c.contentId === content._id);
        if (!isCompleted && content._id) {
            try {
                const updatedProgress = await updateProgress({
                    courseId,
                    contentId: content._id,
                    type: content.type
                });
                setProgressData(updatedProgress);
            } catch (err) {
                console.error("Progress update failed", err);
            }
        }
    };

    // Helper: Get Progress % for a Subject
    const getSubjectProgress = (subjectName) => {
        if (!progressData || !progressData.subjectProgress) return 0;
        const sub = progressData.subjectProgress.find(s => s.subject === subjectName);
        return sub ? sub.percentage : 0;
    };

    // Helper: Get Progress % for a Chapter
    const getChapterProgress = (chapterTitle) => {
        if (!progressData || !progressData.chapterProgress) return { percentage: 0, status: 'Not Started' };
        const ch = progressData.chapterProgress.find(c => c.chapterTitle === chapterTitle);
        if (!ch) return { percentage: 0, status: 'Not Started' };
        return { percentage: ch.percentage, status: ch.status === 'completed' ? 'Completed' : 'In Progress' };
    };

    // Check if content is done
    const isContentCompleted = (contentId) => {
        return progressData?.completedContents?.some(c => c.contentId === contentId);
    };

    // Reset navigation when tab changes
    useEffect(() => {
        setSelectedSubject(null);
        setSelectedChapter(null);
    }, [activeTab]);

    const toggleSubject = (index) => {
        setExpandedSubjects(prev => ({ ...prev, [index]: !prev[index] }));
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
                <Loader className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (!course) return null;

    const tabs = [
        { id: 'live', label: 'Live Classes', icon: Video, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 'recorded', label: 'Recorded', icon: PlayCircle, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 'notes', label: 'Notes', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'tests', label: 'Tests', icon: List, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'deadlines', label: 'Deadlines', icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    // Subject Card Styling Helper
    const getSubjectStyle = (subjectName) => {
        const name = subjectName?.toLowerCase() || '';
        if (name.includes('math')) return { gradient: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-200' };
        if (name.includes('physic')) return { gradient: 'from-violet-500 to-indigo-400', shadow: 'shadow-violet-200' };
        if (name.includes('chem')) return { gradient: 'from-amber-400 to-orange-400', shadow: 'shadow-orange-200' };
        if (name.includes('bio')) return { gradient: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-200' }; // Green for Bio
        if (name.includes('science')) return { gradient: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-200' };

        // Default cyclical
        return { gradient: 'from-slate-500 to-slate-400', shadow: 'shadow-slate-200' };
    };

    // Helper: Drill-down Card Flow
    const renderDrillDownFlow = (type) => {
        // Filter helper to match backend content type + optional title keyword
        const matchesType = (c) => {
            // If we are looking for 'quiz', we look for 'test' type with 'Quiz' in title
            if (type === 'quiz') {
                return c.type === 'test' && c.title && c.title.toLowerCase().includes('quiz');
            }
            // If we are looking for 'test', we look for 'test' type WITHOUT 'Quiz' in title
            if (type === 'test') {
                return c.type === 'test' && c.title && !c.title.toLowerCase().includes('quiz');
            }
            return c.type === type;
        };

        if (!course.curriculum || course.curriculum.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/folder-is-empty-4064360-3363921.png" alt="Empty" className="w-48 mb-4 mix-blend-multiply dark:mix-blend-normal" />
                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">Content Coming Soon</p>
                </div>
            );
        }

        const subjectsWithContent = course.curriculum.filter(sub =>
            sub.chapters && sub.chapters.some(ch =>
                ch.contents && ch.contents.some(c => matchesType(c))
            )
        );

        // LEVEL 1: Select Subject Cards
        if (!selectedSubject) {
            if (subjectsWithContent.length === 0) {
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Layers className="text-slate-300" size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No {type === 'quiz' ? 'Quizzes' : type === 'test' ? 'Tests' : type} Found</h3>
                        <p className="text-slate-500 mt-1">We are updating the course content. Check back later!</p>
                    </div>
                );
            }

            return (
                <div className="animate-fade-in-up">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Explore Subjects</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjectsWithContent.map((subject, idx) => {
                            const style = getSubjectStyle(subject.subject);
                            const itemCount = subject.chapters.reduce((acc, ch) => acc + (ch.contents?.filter(c => matchesType(c)).length || 0), 0);
                            const progress = getSubjectProgress(subject.subject);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSubject(subject)}
                                    className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left`}
                                >
                                    {/* Background decorative blob */}
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${style.gradient} blur-2xl group-hover:scale-150 transition-transform duration-500`} />

                                    <div className="relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${style.gradient} shadow-lg text-white`}>
                                            <BookOpen size={28} />
                                        </div>

                                        <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                                            {subject.subject}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                            <span>{subject.chapters.length} Chapters</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{itemCount} Resources</span>
                                        </div>

                                        {/* Real Progress Bar */}
                                        <div className="mt-6">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${style.gradient} transition-all duration-1000`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // LEVEL 2: Select Chapter Cards
        if (!selectedChapter) {
            const relevantChapters = selectedSubject.chapters.filter(ch => ch.contents && ch.contents.some(c => matchesType(c)));
            return (
                <div className="animate-fade-in-right">
                    {/* Breadcrumbs / Back */}
                    <button
                        onClick={() => setSelectedSubject(null)}
                        className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        <span>Back to Subjects</span>
                    </button>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                            {selectedSubject.subject}
                        </span>
                        <span className="text-slate-300 text-xl font-light">/</span>
                        <span>Select Chapter</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {relevantChapters.map((chapter, idx) => {
                            const { percentage, status } = getChapterProgress(chapter.title);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedChapter(chapter)}
                                    className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-indigo-300 transition-all text-left flex items-start gap-5"
                                >
                                    <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Layers size={20} />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                                            {chapter.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 line-clamp-2 mt-1 mb-3">{chapter.description}</p>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md">
                                                    {chapter.contents.filter(c => matchesType(c)).length} Files
                                                </span>
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                percentage > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {status === 'Not Started' ? 'Start' : status}
                                            </div>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
                                            <div
                                                className={`h-full ${status === 'Completed' ? 'bg-green-500' : 'bg-indigo-500'} transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="self-center opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                                        <ChevronRight className="text-indigo-400" size={20} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // LEVEL 3: View Content List
        const relevantContent = selectedChapter.contents.filter(c => matchesType(c));
        return (
            <div className="animate-fade-in-right">
                {/* Custom Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500 mb-8 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm w-fit">
                    <button onClick={() => setSelectedSubject(null)} className="hover:text-indigo-600 transition px-2 py-1 rounded hover:bg-slate-50">Subjects</button>
                    <ChevronRight size={14} className="text-slate-300" />
                    <button onClick={() => setSelectedChapter(null)} className="hover:text-indigo-600 transition px-2 py-1 rounded hover:bg-slate-50">{selectedSubject.subject}</button>
                    <ChevronRight size={14} className="text-slate-300" />
                    <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{selectedChapter.title}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {relevantContent.map((content, idx) => {
                        const isDone = isContentCompleted(content._id);
                        return (
                            <div key={idx} className={`group relative bg-white dark:bg-slate-800 rounded-2xl border ${isDone ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700'} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col`}>
                                <div className={`h-1.5 w-full ${isDone ? 'bg-green-500' : (type === 'video' ? 'bg-red-500' : type === 'note' ? 'bg-blue-500' : 'bg-emerald-500')}`} />

                                <div className="p-6 flex flex-col flex-1 h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${isDone ? 'bg-green-50 text-green-600' :
                                                (type === 'video' ? 'bg-red-50 text-red-500' :
                                                    type === 'note' ? 'bg-blue-50 text-blue-500' :
                                                        'bg-emerald-50 text-emerald-500')
                                            }`}>
                                            {isDone ? <CheckCircle size={24} /> : (type === 'video' && <PlayCircle size={24} />)}
                                            {!isDone && type === 'note' && <FileText size={24} />}
                                            {!isDone && (type === 'test' || type === 'quiz') && <List size={24} />}
                                        </div>
                                        {content.duration && (
                                            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                                                <Clock size={12} /> {content.duration}
                                            </span>
                                        )}
                                    </div>

                                    <h5 className={`font-bold text-lg leading-tight mb-2 transition-colors ${isDone ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white group-hover:text-indigo-600'}`}>
                                        {content.title}
                                    </h5>

                                    <div className="mt-auto pt-6">
                                        <button
                                            onClick={() => handleContentClick(content)}
                                            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isDone
                                                    ? 'bg-green-50 text-green-600 cursor-default'
                                                    : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900'
                                                }`}
                                        >
                                            {isDone ? 'Completed' : (type === 'video' ? 'Watch Now' : type === 'note' ? 'View PDF' : 'Start Test')}
                                            {!isDone && <ChevronRight size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getContentByTab = () => {
        switch (activeTab) {
            case 'live':
                return (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Video size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Live Class Scheduled</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">Upcoming live sessions will be listed here. Check your schedule!</p>
                    </div>
                );
            case 'recorded':
                // Keeping Accordion for videos but upgrading the design
                return renderDrillDownFlow('video');
            case 'notes':
                return renderDrillDownFlow('note');
            case 'tests':
                return renderDrillDownFlow('test');
            case 'quiz':
                return renderDrillDownFlow('quiz');
            case 'deadlines':
                return (
                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-75">
                        <div className="mb-6">
                            <Clock size={64} className="text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">You're All Caught Up!</h3>
                        <p className="text-slate-500 mt-2">No pending assignments or deadlines.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 font-sans">
            {/* Minimal Header */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 transition-all">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => navigate('/my-courses')} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="hidden sm:inline">My Batches</span>
                        </button>

                        <div className="flex items-center gap-4">
                            {/* Mock Progress Widget */}
                            <div className="hidden sm:flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-600">
                                <BarChart2 size={16} className="text-indigo-500" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Overall Progress</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-white leading-none mt-0.5">
                                        {progressData?.overallProgress || 0}% Completed
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{course.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">{course.classLevel}</span>
                                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">{course.subject}</span>
                            </div>
                        </div>

                        {/* Interactive Tabs */}
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                            {tabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        <tab.icon size={16} className={isActive ? 'text-white' : tab.color} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto p-4 md:px-8 md:py-8">
                {getContentByTab()}
            </div>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CourseLearning;
