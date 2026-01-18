import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    BookOpen,
    Bell,
    Trophy,
    Clock,
    Zap,
    TrendingUp,
    CheckCircle,
    ListTodo,
    AlertCircle,
    PlayCircle,
    PlusCircle,
    FileText,
    Calendar,
    Layout,
    Brain,
    X,
    MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";
import {
    createTask,
    updateTask,
    deleteTask as deleteTaskAPI,
    getTasks
} from "../api/tasks";
import API from "../api/axios";
import { classData } from "../classData";
import DashboardLoader from "./DashboardLoader";

const StudentDashboard = () => {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        streak: 0,
        avgScore: 0,
        totalXP: 0,
        weeklyHours: 0,
        completedChapters: 0,
    });

    // Task Planner Stats
    const [taskStats, setTaskStats] = useState({
        completedTasks: 0,
        pendingTasks: 0
    });

    // Notifications State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [unreadChats, setUnreadChats] = useState([]);
    const [chatStates, setChatStates] = useState({});
    const notifRef = React.useRef(null);

    const [continueLearning, setContinueLearning] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Prepare promises for concurrent fetching
                const statsPromise = API.get("/quiz/stats").catch(err => ({ error: err }));
                const historyPromise = API.get("/quiz/history?limit=50").catch(err => ({ error: err }));
                const tasksPromise = getTasks().catch(err => ({ error: err }));
                const progressPromise = (() => {
                    const userClass = userData?.class || 10;
                    return API.get(`/progress/getSubjectProgress?classId=${userClass}`).catch(err => ({ error: err }));
                })();

                // Execute all requests in parallel
                const [statsRes, historyRes, tasksCompRes, progressRes] = await Promise.all([
                    statsPromise,
                    historyPromise,
                    tasksPromise,
                    progressPromise
                ]);

                // 1. Process User Stats
                const streak = (!statsRes.error && statsRes.data?.data?.streak) || 0;

                // 2. Process Quiz History
                const attempts = (!historyRes.error && historyRes.data?.data?.attempts) ? historyRes.data.data.attempts : [];

                // Calculate Quiz Stats
                const totalQuizzes = attempts.length;
                const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
                const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
                // XP Calculation: Score * 10
                const totalXP = attempts.reduce((acc, curr) => acc + ((curr.score || 0) * 10), 0);

                // Calculate Weekly Hours
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const weeklyMinutes = attempts.reduce((acc, curr) => {
                    const quizDate = new Date(curr.createdAt);
                    if (quizDate > oneWeekAgo) {
                        if (curr.endTime && curr.createdAt) {
                            const duration = (new Date(curr.endTime) - new Date(curr.createdAt)) / 1000 / 60; // minutes
                            return acc + duration;
                        }
                        return acc + 15; // Fallback estimate
                    }
                    return acc;
                }, 0);
                const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;

                // 3. Process Tasks
                const tasks = (!tasksCompRes.error && tasksCompRes.tasks) ? tasksCompRes.tasks : [];
                const completedTasks = tasks.filter(t => t.isCompleted).length;
                const pendingTasks = tasks.length - completedTasks;

                setTaskStats({
                    completedTasks,
                    pendingTasks
                });

                // 4. Process Progress
                const progressData = (!progressRes.error && Array.isArray(progressRes.data)) ? progressRes.data : [];

                // Prepare "Continue Learning"
                const workingOn = [];
                const userClass = userData?.class || 10;
                const clsData = classData[userClass];
                const allSubjects = clsData ? [...clsData.subjects] : [];
                const flatsubs = [];
                allSubjects.forEach(s => {
                    if (s.subSubjects) flatsubs.push(...s.subSubjects);
                    else flatsubs.push(s);
                });

                progressData.forEach(p => {
                    // Only show subjects that have STARTED (completion > 0) but not finished
                    if (p.completion > 0 && p.completion < 100) {
                        const sub = flatsubs.find(s => s.id === p.subjectId);
                        if (sub) {
                            workingOn.push({
                                title: sub.name,
                                subject: sub.name, // or parent name
                                type: 'Subject',
                                completion: p.completion,
                                id: sub.id
                            });
                        }
                    }
                });

                // Calculate Completed Chapters
                const completedChapters = progressData.reduce((acc, curr) => {
                    return acc + (curr.notesCompleted?.length || 0);
                }, 0);

                setContinueLearning(workingOn.slice(0, 3));

                setStats({
                    streak,
                    avgScore,
                    totalXP,
                    weeklyHours,
                    completedChapters,
                    recentActivity: attempts.slice(0, 3)
                });

            } catch (error) {
                console.error("Dashboard data fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };

        const fetchNotifications = async () => {
            try {
                const res = await API.get("/user/notifications");
                if (res.data.success) {
                    setSystemNotifications(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications");
            }
        };

        const pollMessages = async () => {
            try {
                const response = await API.get('/message/conversations');
                if (response.data.success) {
                    const chats = response.data.data;
                    const newChatStates = {};
                    let hasChanges = false;
                    let shouldNotify = Object.keys(chatStates).length > 0;

                    chats.forEach(chat => {
                        const prevUnread = chatStates[chat.id] || 0;
                        const currentUnread = chat.unread || 0;

                        if (shouldNotify && currentUnread > prevUnread) {
                            toast((t) => (
                                <div
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        navigate('/chat', { state: { selectedChatId: chat.id } });
                                    }}
                                    className="cursor-pointer flex flex-col gap-1 min-w-[200px]"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <p className="font-bold text-slate-800">New Message</p>
                                    </div>
                                    <p className="font-medium text-blue-600 text-sm">{chat.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                                </div>
                            ), {
                                duration: 5000,
                                position: 'top-center',
                                style: {
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                }
                            });
                        }

                        if (prevUnread !== currentUnread) hasChanges = true;
                        newChatStates[chat.id] = currentUnread;
                    });

                    if (hasChanges || Object.keys(chatStates).length !== chats.length) {
                        setChatStates(newChatStates);
                    }
                    setUnreadChats(chats.filter(c => c.unread > 0));
                }
            } catch (error) {
                // Silent error
            }
        };

        fetchDashboardData();
        fetchNotifications();
        const interval = setInterval(pollMessages, 5000);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userData, chatStates]);

    const handleNotificationClick = async (item) => {
        setIsNotificationsOpen(false);
        if (item.type === 'chat') {
            navigate('/chat', { state: { selectedChatId: item.id } });
        } else {
            if (!item.read) {
                try {
                    await API.put(`/user/notifications/${item.id}/read`);
                    setSystemNotifications(prev => prev.map(n => n._id === item.id ? { ...n, readBy: [...n.readBy, userData._id] } : n));
                } catch (e) { console.error(e); }
            }
        }
    };

    const allNotifications = [
        ...unreadChats.map(c => ({
            id: c.id,
            type: 'chat',
            title: c.name,
            message: c.lastMessage || 'New message',
            time: c.time || new Date(),
            read: false,
            initial: c.name ? c.name.charAt(0) : '?'
        })),
        ...systemNotifications.map(n => ({
            id: n._id,
            type: 'system',
            title: n.title,
            message: n.message,
            time: n.createdAt,
            read: n.readBy && n.readBy.includes(userData?._id),
            initial: 'S'
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    const unreadCount = allNotifications.filter(n => !n.read).length;

    if (loading) {
        return <DashboardLoader />;
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
            {/* 1. Header Stats Section */}
            <div className="bg-gradient-to-br from-[#0f1f3c] via-[#1a3a6a] to-primary rounded-2xl p-4 md:p-6 text-white shadow-xl relative border border-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Trophy size={120} />
                </div>

                <div className="relative z-10 mb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {userData?.name?.split(" ")[0]}! 👋</h1>
                        <p className="text-white/80 text-sm md:text-base">You're doing great! Keep up the momentum.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notification Icon */}
                        <div className="relative" ref={notifRef}>
                            {/* Backdrop Blur Overlay */}
                            {isNotificationsOpen && (
                                <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-[90] animate-in fade-in duration-300" onClick={() => setIsNotificationsOpen(false)}></div>
                            )}

                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`hidden md:block p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all relative ${isNotificationsOpen ? 'z-[101] border-white/40 ring-4 ring-white/10' : 'z-10'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary"></span>
                                )}
                            </button>

                            {/* Dashboard Notification Popover */}
                            {isNotificationsOpen && (
                                <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[101] animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                        <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                        <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                    <div className="max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                        {allNotifications.length > 0 ? (
                                            allNotifications.map(item => (
                                                <div
                                                    key={item.id + item.type}
                                                    onClick={() => handleNotificationClick(item)}
                                                    className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-3 ${!item.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'chat' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        {item.type === 'chat' ? (item.initial) : <Bell size={16} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{new Date(item.time).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-10 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                                                    <Bell size={20} className="text-slate-400" />
                                                </div>
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Streak */}
                        <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                            <Zap className="text-yellow-400 fill-yellow-400" size={16} />
                            <span className="font-bold">{stats.streak} Day Streak</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {/* Stat Card 1 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <TrendingUp className="text-emerald-400" size={18} />
                            <span className="text-xs md:text-sm text-white/70">Avg Score</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">{stats.avgScore}%</div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <BookOpen className="text-blue-300" size={18} />
                            <span className="text-xs md:text-sm text-white/70">Completed</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">{stats.completedChapters} <span className="text-xs md:text-sm font-normal opacity-70">Ch</span></div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <Clock className="text-orange-300" size={18} />
                            <span className="text-xs md:text-sm text-white/70">This Week</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">{stats.weeklyHours}h</div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="group relative bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 cursor-help">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <Trophy className="text-yellow-400" size={18} />
                            <span className="text-xs md:text-sm text-white/70">Total XP</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">{stats.totalXP}</div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 hidden md:block">
                            Points based on Quiz Scores (Score × 10)
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">

                {/* 1. Continue Learning (Top Left - Large) */}
                <div className="lg:col-span-2 xl:col-span-2 bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Continue Learning</h2>
                        <Link to="/notes" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
                    </div>

                    <div className="space-y-3 md:space-y-4 flex-1">
                        {continueLearning.length > 0 ? continueLearning.map((item, idx) => (
                            <div key={idx} onClick={() => navigate('/notes', { state: { selectedSubjectId: item.id } })} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:border-blue-500 border border-transparent transition-all group cursor-pointer">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.subject} Progress</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 md:gap-4 w-1/3">
                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.completion}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.completion}%</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No active courses yet. Start learning!</p>
                                <Link to="/notes" className="text-blue-600 text-sm mt-2 hover:underline">Browse Subjects</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Task Planner Overview (Top Middle - Small) */}
                <div className="lg:col-span-1 xl:col-span-1 bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <ListTodo className="text-blue-500" size={24} />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Task Planner</h2>
                    </div>

                    <div className="flex flex-col gap-4 md:gap-6 flex-1 justify-between">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {/* Completed */}
                            <div className="p-3 md:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                <div className="flex items-center gap-2 mb-1 md:mb-2">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span className="text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-400">Completed</span>
                                </div>
                                <div className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-300">{taskStats.completedTasks}</div>
                            </div>

                            {/* Pending */}
                            <div className="p-3 md:p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                <div className="flex items-center gap-2 mb-1 md:mb-2">
                                    <AlertCircle size={16} className="text-amber-500" />
                                    <span className="text-xs md:text-sm font-medium text-amber-700 dark:text-amber-400">Pending</span>
                                </div>
                                <div className="text-xl md:text-2xl font-bold text-amber-800 dark:text-amber-300">{taskStats.pendingTasks}</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Link to="/notes" className="block w-full text-center py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                                Manage Tasks
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. Recent Activity (Top Right - Small) */}
                <div className="lg:col-span-1 xl:col-span-1 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-purple-500" size={24} />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h2>
                    </div>

                    <div className="space-y-3 md:space-y-4 flex-1">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{activity.quizTitle || "Quiz Attempt"}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${activity.score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : activity.score >= 50 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                        {activity.score}%
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center py-6 text-slate-500 text-sm">
                                No recent activity found.
                            </div>
                        )}
                        <Link to="/quiz" className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">
                            View Full History
                        </Link>
                    </div>
                </div>

                {/* 4. Recommended Practice (Bottom Left - Large) */}
                <div className="lg:col-span-2 xl:col-span-2 bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recommended Practice</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex-1 text-center md:text-left gap-4">
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 text-lg justify-center md:justify-start">
                                <Trophy size={20} className="text-indigo-500" />
                                Test Your Knowledge
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                                Take a new quiz to earn XP and track your improvement.
                            </p>
                        </div>
                        <Link to="/quiz" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg w-full md:w-auto justify-center">
                            <PlusCircle size={18} />
                            Attempt New Quiz
                        </Link>
                    </div>
                </div>

                {/* 5. Quick Access Widget (Bottom Right - Large) */}
                <div className="lg:col-span-3 xl:col-span-2 bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout className="text-orange-500" size={24} />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Quick Access</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 flex-1">
                        <Link to="/notes" className="flex flex-col items-center justify-center py-3 md:py-4 px-3 md:px-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-center group">
                            <BookOpen className="text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Study Notes</span>
                        </Link>
                        <Link to="/quiz" className="flex flex-col items-center justify-center py-3 md:py-4 px-3 md:px-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition text-center group">
                            <Brain className="text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Quizzes</span>
                        </Link>
                        <Link to={userData?.class == 9 ? "/exam-ready" : "/board-ready"} className="flex flex-col items-center justify-center py-3 md:py-4 px-3 md:px-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition text-center group">
                            <FileText className="text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">{userData?.class == 9 ? "Exam Ready" : "Board Ready"}</span>
                        </Link>
                        <Link to="/events" className="flex flex-col items-center justify-center py-3 md:py-4 px-3 md:px-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-center group">
                            <Calendar className="text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Planner</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
