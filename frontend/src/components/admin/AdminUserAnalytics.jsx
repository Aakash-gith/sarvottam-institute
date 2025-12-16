import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { Search, ChevronDown, ChevronUp, User, BookOpen, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const AdminUserAnalytics = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [userAnalytics, setUserAnalytics] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(
                (user) =>
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await API.get("/admin/users");
            if (response.data.success) {
                setUsers(response.data.data);
                setFilteredUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserAnalytics = async (userId) => {
        try {
            setAnalyticsLoading(true);
            const response = await API.get(`/admin/users/${userId}/analytics`);
            if (response.data.success) {
                setUserAnalytics(response.data.data);
                setSelectedUser(userId);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to load user analytics");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
        setUserAnalytics(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Progress Analytics</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Class {user.class}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">🔥 {user.streak || 0} days</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => fetchUserAnalytics(user._id)}
                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                    >
                                        View Details <ChevronDown size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Analytics Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-800">
                                Analytics for {userAnalytics?.user?.name}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <AlertCircle size={24} className="rotate-45" /> Close
                            </button>
                        </div>

                        {analyticsLoading ? (
                            <div className="p-10 flex justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-8">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <BookOpen className="text-blue-600" size={24} />
                                            <h4 className="font-semibold text-gray-700">Notes Read</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-700">
                                            {userAnalytics?.progress?.reduce((acc, curr) => acc + (curr.notesRead || 0), 0) || 0}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="text-purple-600" size={24} />
                                            <h4 className="font-semibold text-gray-700">Lectures Watched</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-purple-700">
                                            {userAnalytics?.progress?.reduce((acc, curr) => acc + (curr.lecturesWatched || 0), 0) || 0}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <User className="text-green-600" size={24} />
                                            <h4 className="font-semibold text-gray-700">Quizzes Taken</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-green-700">
                                            {userAnalytics?.quizAttempts?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Quiz History */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-4">Quiz History</h4>
                                    {userAnalytics?.quizAttempts?.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No quizzes taken yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {userAnalytics?.quizAttempts?.map((attempt) => (
                                                <QuizAttemptCard key={attempt._id} attempt={attempt} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for individual quiz attempt
const QuizAttemptCard = ({ attempt }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <h5 className="font-bold text-gray-800">{attempt.quiz?.title || attempt.topic}</h5>
                    <p className="text-sm text-gray-500">
                        {new Date(attempt.startTime).toLocaleDateString()} • Score:
                        <span className={`font-bold ml-1 ${attempt.score >= 70 ? 'text-green-600' : attempt.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round(attempt.score)}%
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {expanded && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                    <h6 className="text-sm font-semibold text-gray-700">Incorrect Answers:</h6>
                    {attempt.answers.filter(a => !a.isCorrect).length === 0 ? (
                        <p className="text-green-600 text-sm">Perfect score! No incorrect answers.</p>
                    ) : (
                        <div className="space-y-2">
                            {attempt.answers.map((ans, idx) => (
                                !ans.isCorrect && (
                                    <div key={idx} className="bg-red-50 p-2 rounded text-sm">
                                        <p className="font-medium text-gray-800">Q: Question {ans.questionIndex + 1}</p>
                                        {/* Note: We don't have the question text in QuizAttempt, only index. 
                            Ideally we would populate the quiz questions, but for now showing index. 
                            If the user wants full question text, we'd need to fetch the full Quiz object. 
                            User request said: "what was the score which question were incorrect..." 
                        */}
                                        <p className="text-red-600 mt-1">Selected: {ans.selectedAnswer}</p>
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

export default AdminUserAnalytics;
