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
    PlusCircle
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
                    completedChapters
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Header Stats Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={120} />
                </div>

                <div className="relative z-10 mb-6">
                    <h1 className="text-3xl font-bold mb-1">Welcome back, {userData?.name?.split(" ")[0]}! 👋</h1>
                    <p className="text-blue-100 opacity-90">You're doing great! Keep up the momentum.</p>
                    <div className="absolute top-0 right-0 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                        <span className="font-bold">{stats.streak} Day Streak</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Stat Card 1 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="text-emerald-400" size={20} />
                            <span className="text-sm text-blue-100">Avg Score</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.avgScore}%</div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="text-blue-300" size={20} />
                            <span className="text-sm text-blue-100">Completed</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.completedChapters} <span className="text-sm font-normal opacity-70">Ch</span></div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="text-orange-300" size={20} />
                            <span className="text-sm text-blue-100">This Week</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.weeklyHours}h</div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="group relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 cursor-help">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="text-yellow-400" size={20} />
                            <span className="text-sm text-blue-100">Total XP</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.totalXP}</div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            Points based on Quiz Scores (Score × 10)
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Left Column: Continue Learning & Recommended */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Continue Learning */}
                    <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Continue Learning</h2>
                            <Link to="/notes" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {continueLearning.length > 0 ? continueLearning.map((item, idx) => (
                                <div key={idx} onClick={() => navigate('/notes', { state: { selectedSubjectId: item.id } })} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:border-blue-500 border border-transparent transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.subject} Progress</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-1/3">
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

                    {/* Recommended Practice */}
                    <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recommended Practice</h2>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                                    <Trophy size={20} className="text-indigo-500" />
                                    Test Your Knowledge
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                                    Take a new quiz to earn XP and track your improvement.
                                </p>
                            </div>
                            <Link to="/quiz" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg">
                                <PlusCircle size={18} />
                                Attempt New Quiz
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. Right Column: Task Planner Overview (Replaces Radar) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <ListTodo className="text-blue-500" size={24} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Task Planner Overview</h2>
                        </div>

                        <div className="flex flex-col gap-6">


                            <div className="grid grid-cols-2 gap-4">
                                {/* Completed */}
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle size={16} className="text-emerald-500" />
                                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Completed</span>
                                    </div>
                                    <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{taskStats.completedTasks}</div>
                                </div>

                                {/* Pending */}
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle size={16} className="text-amber-500" />
                                        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending</span>
                                    </div>
                                    <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">{taskStats.pendingTasks}</div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link to="/notes" className="block w-full text-center py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                                    Manage Tasks
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
