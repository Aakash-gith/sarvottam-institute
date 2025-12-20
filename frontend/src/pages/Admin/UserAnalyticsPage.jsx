import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';
import { User, BookOpen, Clock, AlertCircle, ChevronUp, ChevronDown, Trophy, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const UserAnalyticsPage = () => {
    const { userId } = useParams();
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/admin/users/${userId}/analytics`);
                if (response.data.success) {
                    setUserAnalytics(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
                toast.error("Failed to load user analytics");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchAnalytics();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!userAnalytics) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-500">
                User analytics not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 font-poppins">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                            Student Report: {userAnalytics.user?.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Class {userAnalytics.user?.class || 'N/A'}
                            </span>
                            <span>{userAnalytics.user?.email}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-center gap-3">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase">Streak</p>
                                <p className="font-bold text-slate-800 dark:text-white">{userAnalytics.user?.streak || 0} Days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={BookOpen}
                        label="Notes Read"
                        value={userAnalytics.progress?.reduce((acc, curr) => acc + (curr.notesRead || 0), 0) || 0}
                        color="text-blue-600"
                        bgColor="bg-blue-50 dark:bg-blue-900/20"
                        borderColor="border-blue-100 dark:border-blue-800"
                    />
                    <StatCard
                        icon={Clock}
                        label="Lectures Watched"
                        value={userAnalytics.progress?.reduce((acc, curr) => acc + (curr.lecturesWatched || 0), 0) || 0}
                        color="text-purple-600"
                        bgColor="bg-purple-50 dark:bg-purple-900/20"
                        borderColor="border-purple-100 dark:border-purple-800"
                    />
                    <StatCard
                        icon={Trophy}
                        label="Quizzes Taken"
                        value={userAnalytics.quizAttempts?.length || 0}
                        color="text-emerald-600"
                        bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                        borderColor="border-emerald-100 dark:border-emerald-800"
                    />
                </div>

                {/* Sub-Subject Progress (Optional - if available in future) */}

                {/* Quiz History */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="text-blue-500" /> Quiz Logic & History
                    </h2>

                    {userAnalytics.quizAttempts?.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">No quizzes attempted by this student yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userAnalytics.quizAttempts?.map((attempt) => (
                                <QuizAttemptDetailCard key={attempt._id} attempt={attempt} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bgColor, borderColor }) => (
    <div className={`p-6 rounded-2xl ${bgColor} border ${borderColor} flex items-center gap-4`}>
        <div className={`p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <h4 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase">{label}</h4>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

const QuizAttemptDetailCard = ({ attempt }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
            <div
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg 
                        ${attempt.score >= 80 ? 'bg-emerald-100 text-emerald-600' :
                            attempt.score >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                        {Math.round(attempt.score)}%
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{attempt.quiz?.title || attempt.topic}</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(attempt.startTime).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(attempt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-sm font-medium">{expanded ? 'Hide Details' : 'View Report'}</span>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 animate-in slide-in-from-top-2 duration-300">
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle size={16} /> Performance Analysis
                    </h5>

                    {attempt.answers?.filter(a => !a.isCorrect).length === 0 ? (
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
                            <Trophy size={24} />
                            <div>
                                <p className="font-bold">Perfect Score!</p>
                                <p className="text-sm opacity-90">All questions were answered correctly. Outstanding performance!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {attempt.answers?.map((ans, idx) => (
                                !ans.isCorrect && (
                                    <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">Question {ans.questionIndex + 1}</span>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Student Selected</p>
                                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    {ans.selectedAnswer}
                                                </div>
                                            </div>
                                            {/* Note: Correct answer usually not stored in AttemptSchema for security/simplicity in some designs, 
                                                but if it were, we'd show it here. Assuming we focus on what was WRONG. */}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserAnalyticsPage;
