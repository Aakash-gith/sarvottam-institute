import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    BookOpen,
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
    Brain
} from "lucide-react";
import {
    createTask,
    updateTask,
    deleteTask as deleteTaskAPI,
    getTasks
} from "../api/tasks";
import API from "../api/axios";
import { classData } from "../classData";

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

    const [continueLearning, setContinueLearning] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // 1. Fetch User Stats (Streak)
                const statsRes = await API.get("/quiz/stats");
                const streak = statsRes.data.data.streak || 0;

                // 2. Fetch Quiz History (For Avg Score, XP, Weekly Hours)
                const historyRes = await API.get("/quiz/history?limit=50");
                const attempts = historyRes.data.data.attempts;

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

                // 3. Fetch Tasks (Planner)
                const tasksCompRes = await getTasks();
                const tasks = tasksCompRes.tasks || [];
                const completedTasks = tasks.filter(t => t.isCompleted).length;
                const pendingTasks = tasks.length - completedTasks;

                setTaskStats({
                    completedTasks,
                    pendingTasks
                });

                // 4. Fetch Real Progress for Continue Learning
                const userClass = userData?.class || 10;
                const progressRes = await API.get(`/progress/getSubjectProgress?classId=${userClass}`);
                const progressData = Array.isArray(progressRes.data) ? progressRes.data : [];

                // Prepare "Continue Learning"
                const workingOn = [];
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

                // Calculate Completed Chapters (sum of notesCompleted across all subjects)
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

        fetchDashboardData();
    }, [userData]);

    if (loading) {
        return <div className="p-8 text-white">Loading dashboard stats...</div>;
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
            {/* 1. Header Stats Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 md:p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={120} />
                </div>

                <div className="relative z-10 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {userData?.name?.split(" ")[0]}! 👋</h1>
                    <p className="text-blue-100 opacity-90 text-sm md:text-base">You're doing great! Keep up the momentum.</p>
                    <div className="absolute top-0 right-0 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-full">
                        <Zap className="text-yellow-400 fill-yellow-400" size={16} />
                        <span className="font-bold text-sm md:text-base">{stats.streak} Day Streak</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {/* Stat Card 1 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <TrendingUp className="text-emerald-400" size={18} />
                            <span className="text-xs md:text-sm text-blue-100">Avg Score</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">{stats.avgScore}%</div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <BookOpen className="text-blue-300" size={18} />
                            <span className="text-xs md:text-sm text-blue-100">Completed</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">{stats.completedChapters} <span className="text-xs md:text-sm font-normal opacity-70">Ch</span></div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <Clock className="text-orange-300" size={18} />
                            <span className="text-xs md:text-sm text-blue-100">This Week</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">{stats.weeklyHours}h</div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="group relative bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 cursor-help">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <Trophy className="text-yellow-400" size={18} />
                            <span className="text-xs md:text-sm text-blue-100">Total XP</span>
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
                <div className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
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
                <div className="lg:col-span-1 xl:col-span-1 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
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
                <div className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col">
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
                <div className="lg:col-span-3 xl:col-span-2 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm h-full flex flex-col justify-center">
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
                        <Link to="/pyq" className="flex flex-col items-center justify-center py-3 md:py-4 px-3 md:px-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition text-center group">
                            <FileText className="text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">PYQ Papers</span>
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
