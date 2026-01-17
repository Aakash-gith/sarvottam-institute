import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Video,
    Brain,
    Target,
    TrendingUp,
    Clock,
    ChevronDown,
    ChevronUp,
    BarChart3,
    Award,
    Flame,
    Zap,
    CheckCircle2,
    XCircle
} from "lucide-react";
import API from "../../api/axios";
import { classData } from "../../classData";

const AnalyticsView = ({ stats, userData }) => {
    const navigate = useNavigate();
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetailedProgress();
    }, [userData]);

    const fetchDetailedProgress = async () => {
        try {
            const userClass = userData?.class || 10;
            const response = await API.get(`/progress/getSubjectProgress?classId=${userClass}`);
            if (response.status === 200) {
                // Map with names from classData
                const clsData = classData[userClass];
                const allSubjects = clsData ? [...clsData.subjects] : [];
                const flatsubs = [];
                allSubjects.forEach(s => {
                    if (s.subSubjects) flatsubs.push(...s.subSubjects);
                    else flatsubs.push(s);
                });

                const enrichedProgress = response.data.map(p => {
                    const sub = flatsubs.find(s => s.id === p.subjectId);
                    return {
                        ...p,
                        name: sub ? sub.name : `Subject ${p.subjectId}`
                    };
                });
                setProgressData(enrichedProgress);
            }
        } catch (error) {
            console.error("Failed to fetch detailed progress", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card dark:bg-slate-900/50 p-6 rounded-2xl border border-border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BarChart3 size={28} className="text-primary" />
                        Learning Analytics
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Detailed breakdown of your academic performance and progress.</p>
                </div>
                <button
                    onClick={() => navigate('/profile?view=account')}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm border border-border"
                >
                    <ChevronUp className="-rotate-90" size={18} />
                    Back to Profile
                </button>
            </div>

            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Overall Progress"
                    value={`${Math.round(progressData.reduce((acc, curr) => acc + (curr.completion || 0), 0) / (progressData.length || 1))}%`}
                    icon={TrendingUp}
                    color="blue"
                    desc="Weighted average across all subjects"
                />
                <StatCard
                    title="Quiz Accuracy"
                    value={`${stats.averageScore || 0}%`}
                    icon={Target}
                    color="emerald"
                    desc="Average score across all attempts"
                />
                <StatCard
                    title="Learning Streak"
                    value={`${stats.currentStreak || 0} Days`}
                    icon={Flame}
                    color="orange"
                    desc="Keep it up for consistent growth!"
                />
                <StatCard
                    title="Total XP"
                    value={stats.totalXP || 0}
                    icon={Zap}
                    color="purple"
                    desc="Experience points earned"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subject-wise Breakdown */}
                <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary" />
                        Subject-wise Progress
                    </h3>
                    <div className="space-y-6">
                        {progressData.length > 0 ? progressData.map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                                    <span className="text-gray-500">{item.completion}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${item.completion}%` }}
                                    />
                                </div>
                                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <span className="flex items-center gap-1"><BookOpen size={10} /> {item.notesRead || 0} Notes</span>
                                    <span className="flex items-center gap-1"><Video size={10} /> {item.lecturesWatched || 0} Lectures</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-10 text-gray-500 italic">No progress data available yet. Start learning!</p>
                        )}
                    </div>
                </div>

                {/* Recent Quiz Performance */}
                <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Award size={20} className="text-primary" />
                        Recent Quiz attempts
                    </h3>
                    <div className="space-y-4">
                        {stats.recentQuizzes && stats.recentQuizzes.length > 0 ? stats.recentQuizzes.map((quiz, idx) => (
                            <QuizHistoryItem key={idx} quiz={quiz} />
                        )) : (
                            <div className="text-center py-10 opacity-60">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Brain size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500">No recent quizzes found.</p>
                            </div>
                        )}
                        {stats.recentQuizzes?.length > 0 && (
                            <button className="w-full py-3 mt-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-dashed border-primary/30">
                                View Full History
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Topic Mastery Heatmap Placeholder / Detailed Stats */}
            <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Target size={20} className="text-primary" />
                    Topic Mastery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.favoriteTopics && stats.favoriteTopics.length > 0 ? stats.favoriteTopics.map((topic, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-border flex justify-between items-center group hover:border-primary/50 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">{topic.topic}</h4>
                                <p className="text-xs text-gray-500">{topic.count} Attempts</p>
                            </div>
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                                {idx + 1}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-10 text-center text-gray-500 italic">
                            Complete more quizzes to identify your strengths!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, desc }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    };

    return (
        <div className="bg-card dark:bg-slate-900/50 border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon size={20} />
                </div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h4>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{value}</div>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{desc}</p>
        </div>
    );
};

const QuizHistoryItem = ({ quiz }) => {
    const [expanded, setExpanded] = useState(false);

    // We can't fetch detailed incorrect answers here without an additional API call,
    // but we can show the basic score and correct/total info.

    return (
        <div className="group border border-border rounded-xl p-4 hover:border-primary/30 transition-all bg-background dark:bg-slate-800/30">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${quiz.score >= 80 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" :
                        quiz.score >= 50 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" :
                            "bg-red-100 text-red-600 dark:bg-red-900/30"
                        }`}>
                        {Math.round(quiz.score)}%
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-[150px]">{quiz.topic}</h4>
                        <p className="text-[10px] text-gray-400">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 size={12} /> {quiz.correctAnswers}</span>
                        <span className="text-red-500 flex items-center gap-0.5"><XCircle size={12} /> {quiz.totalQuestions - quiz.correctAnswers}</span>
                    </div>
                    {/* {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />} */}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
