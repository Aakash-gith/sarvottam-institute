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
    });

    // Task Planner Stats
    const [taskStats, setTaskStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressSubjects: 0
    });

    const [continueLearning, setContinueLearning] = useState([]);

    // Calculate Total Available Tasks from static data
    const calculateTotalTasks = (cls) => {
        let total = 0;
        const currentClassData = classData[cls];
        if (!currentClassData) return 0;

        currentClassData.subjects.forEach(sub => {
            if (sub.notes) total += sub.notes.length; // Assuming videos are part of 'content' but notes are the main trackable unit for now in static data structure logic provided previously. 
            // Actually, based on previous files, 'notes' and 'videos' are separate locally but static data usually just lists 'notes' array which might handle both or we just count chapters.
            // Let's count "Chapters" as tasks for simplicity if deep structure isn't fully unified in static data.
            // Looking at classData.js, it has 'notes' array which seems to be chapters.

            if (sub.subSubjects) {
                sub.subSubjects.forEach(ss => {
                    if (ss.notes) total += ss.notes.length;
                });
            }
        });
        return total;
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // 1. Fetch User Stats (Streak)
                const statsRes = await API.get("/quiz/user/stats");
                const streak = statsRes.data.data.streak || 0;

                // 2. Fetch Quiz History (For Avg Score, XP)
                const historyRes = await API.get("/quiz/history?limit=50");
                const attempts = historyRes.data.data.attempts;

                // Calculate Quiz Stats
                const totalQuizzes = attempts.length;
                const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
                const avgScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
                // XP Calculation: Score * 10
                const totalXP = attempts.reduce((acc, curr) => acc + ((curr.score || 0) * 10), 0);

                // 3. Fetch Real Progress for Task Planner
                // We need to fetch all subject progress for the user's class
                const userClass = userData?.class || 10;
                const progressRes = await API.get(`/progress/getSubjectProgress?classId=${userClass}`);
                const progressData = Array.isArray(progressRes.data) ? progressRes.data : [];

                // Calculate Task Stats
                const totalAvailable = calculateTotalTasks(userClass);
                let completedCount = 0;
                let inProgressCount = 0;

                // Aggregate completed items from backend progress
                progressData.forEach(p => {
                    const notesDone = p.notesCompleted?.length || 0;
                    const videosDone = p.videosCompleted?.length || 0;
                    // For "Total Tasks" we counted chapters. Let's count "Items" completed. 
                    // To keep it simple and consistent: 
                    // Task = 1 Chapter Note or Video. 
                    // For now, let's just sum completed notes + videos as "Completed Tasks"
                    completedCount += notesDone + videosDone;

                    if (p.completion > 0 && p.completion < 100) {
                        inProgressCount++;
                    }
                });

                // Adjust Total: Since static data might not list every single video, 
                // but we want a relative "Pending". 
                // Let's set Total = Completed + (Approx Remaining Chapters * 2 items per chapter) 
                // OR just use the handy logic: Total = Static Chapters. Completed = % of that?
                // Let's try: Total Tasks = Static Chapters. 
                // Completed Tasks = Completed Chapters (where completion > 80% maybe?)
                // Actually user requested "Completed, Pending, In Progress".
                // Let's stick to "Items". 
                // If totalAvailable is strictly chapters, let's treat "Task" as "Study Chapter".
                // We count a chapter as "Done" if the backend says it's done? 
                // Backend tracks per subject. 
                // Let's simplify: 
                // Total Tasks = Total Chapters in Syllabus.
                // Completed = Sum of completion % / 100 * Total Chapters? No that's fuzzy.

                // Let's go with:
                // Total Tasks = Total Chapters (from static classData)
                // Completed = Number of subjects * (completion/100)? No.

                // Let's use the provided counts:
                // Completed = `progressData` sum of `notesRead`.
                // Pending = Total - Completed.

                // Refined Logic:
                // Total Tasks = Total Chapters (Notes) in classData.
                // Completed = sum of `notesCompleted.length` from backend.
                // Pending = Total - Completed.

                const totalChapters = calculateTotalTasks(userClass);
                const completedChapters = progressData.reduce((acc, p) => acc + (p.notesCompleted?.length || 0), 0);

                setTaskStats({
                    totalTasks: totalChapters,
                    completedTasks: completedChapters,
                    pendingTasks: Math.max(0, totalChapters - completedChapters),
                    inProgressSubjects: inProgressCount
                });

                // Prepare "Continue Learning"
                // Find subjects with some progress but not 100%
                const workingOn = [];
                // Map backend progress back to subject names
                const clsData = classData[userClass];
                const allSubjects = clsData ? [...clsData.subjects] : [];
                // Flatten sub-subjects
                const flatsubs = [];
                allSubjects.forEach(s => {
                    if (s.subSubjects) flatsubs.push(...s.subSubjects);
                    else flatsubs.push(s);
                });

                progressData.forEach(p => {
                    if (p.completion < 100) {
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

                // If we have very few "In Progress", maybe show "Not Started" ones as suggestions?
                // For now, just show active ones.
                setContinueLearning(workingOn.slice(0, 3));


                setStats({
                    streak,
                    avgScore,
                    totalXP,
                    weeklyHours: 12.5 // Mock
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
                        <div className="text-2xl font-bold">{taskStats.completedTasks} <span className="text-sm font-normal opacity-70">Ch</span></div>
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

                            {/* In Progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 dark:text-slate-400">Active Subjects</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{taskStats.inProgressSubjects}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (taskStats.inProgressSubjects / 6) * 100)}%` }}></div>
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
