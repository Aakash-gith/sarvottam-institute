import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    Award,
    BookOpen,
    Upload,
    Activity,
    Clock,
    UserCheck,
    Briefcase,
    Zap, // Added Zap
    TrendingUp, // Added TrendingUp
    PieChart as PieChartIcon, // Renamed to avoid split
    GraduationCap, // Added back
    X,
    ChevronUp,
    ChevronDown,
    Mail,
    Shield,
    User
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from "../../api/axios";
import toast from "react-hot-toast";
import NotesUpload from "../../components/admin/NotesUpload";
import PYQUpload from "../../components/admin/PYQUpload";
import EventsManager from "../../components/admin/EventsManager";
import NotificationsManager from "../../components/admin/NotificationsManager";
import AdminRequests from "../../components/admin/AdminRequests";
import AdminManagement from "../../components/admin/AdminManagement"; // Added
import AdminUserAnalytics from "../../components/admin/AdminUserAnalytics";
import ClockWidget from "../../components/clock-01";
import ThemeToggle from "../../components/ThemeToggle";
import logo from "../../assets/logo.png";

function AdminDashboard() {
    const [adminInfo, setAdminInfo] = useState(null);
    const [stats, setStats] = useState(null); // Added stats state
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminInfo();
        fetchStats(); // Fetch stats on mount
    }, []);

    const fetchAdminInfo = async () => {
        try {
            const { data } = await API.get("/admin/info");
            setAdminInfo(data.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch admin info:", error);
            toast.error("Failed to load admin profile");
            navigate("/admin/login");
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await API.get("/admin/dashboard-stats");
            setStats(data.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            // Don't block render, just allow stats to be null (will show loaders/zeros)
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin/login");
        toast.success("Logged out successfully");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
            </div>
        );
    }

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard, // Use LayoutDashboard icon
            visible: true,
        },
        {
            id: "students",
            label: "Students",
            icon: GraduationCap,
            visible: true,
        },
        {
            id: "book-upload", // Rename to satisfy "Upload Notes"
            label: "Upload Notes",
            icon: BookOpen,
            visible: adminInfo?.permissions?.uploadNotes,
        },
        {
            id: "pyq-upload",
            label: "Upload PYQ",
            icon: FileText,
            visible: adminInfo?.permissions?.uploadPYQ,
        },
        {
            id: "notifications",
            label: "Send Notifications",
            icon: Bell,
            visible: adminInfo?.permissions?.sendNotifications,
        },
        {
            id: "admin", // Rename "admin-requests" to "admin"
            label: "Admin",
            icon: Users,
            visible: true, // Visible to everyone, roles handled inside
        },
    ];

    return (
        <div className="flex h-screen bg-transparent overflow-hidden font-poppins selection:bg-blue-500 selection:text-white">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? "w-72" : "w-20"
                    } text-slate-800 dark:text-white transition-all duration-500 ease-in-out flex flex-col shadow-2xl z-50 relative`}
                style={{ background: 'var(--sidebar-bg)' }}
            >
                {/* Logo Area */}
                <div
                    className="h-20 flex items-center justify-between px-6 border-b border-blue-500/10 dark:border-slate-800 bg-transparent cursor-pointer hover:bg-blue-500/5 dark:hover:bg-slate-900 transition-colors group"
                    onClick={() => setActiveTab('dashboard')}
                >
                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                        <img src={logo} alt="Sarvottam Logo" className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-300" />
                        <span className={`font-bold text-xl tracking-wide transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 invisible w-0"}`}>
                            Sarvottam
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {menuItems.filter(item => item.visible).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20 text-white translate-x-1"
                                : "text-slate-600 dark:text-slate-400 hover:bg-blue-500/5 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-white hover:translate-x-1"
                                }`}
                        >
                            <item.icon size={22} className={`min-w-[22px] transition-transform duration-300 ${activeTab === item.id ? "scale-110 text-white" : "group-hover:scale-110"}`} />
                            <span className={`whitespace-nowrap font-medium transition-all duration-300 origin-left ${sidebarOpen ? "opacity-100 scale-100" : "opacity-0 scale-0 invisible w-0"}`}>
                                {item.label}
                            </span>

                            {/* Active Indicator Glow */}
                            {activeTab === item.id && (
                                <div className="absolute inset-0 bg-white/10 blur-md rounded-xl"></div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer / Toggle */}
                <div className="p-4 border-t border-blue-500/10 dark:border-slate-800 bg-transparent">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-blue-500/5 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        {sidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 group overflow-hidden ${!sidebarOpen && "justify-center"}`}
                    >
                        <LogOut size={20} className="min-w-[20px] group-hover:rotate-12 transition-transform" />
                        <span className={`whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 invisible"}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white/30 dark:bg-transparent relative transition-colors duration-500">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent -z-10"></div>

                {/* Header */}
                <header className="h-20 bg-[var(--background)]/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0 transition-colors duration-500 gap-8">
                    <div className="flex items-center gap-8 flex-1">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-300 capitalize truncate">
                            {activeTab === 'dashboard' ? `Hello, ${adminInfo?.userId?.name.split(' ')[0] || 'Admin'}!` : (activeTab === 'profile' ? 'My Profile' : menuItems.find(i => i.id === activeTab)?.label)}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Digital Clock */}
                        <div className="hidden md:flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-2xl shadow-sm">
                            <ClockWidgetCompact />
                        </div>
                        <ThemeToggle />
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{adminInfo?.userId?.name || adminInfo?.name || "Master Admin"}</span>
                            <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 capitalize">
                                {adminInfo?.role?.replace('_', ' ')}
                            </span>
                        </div>
                        <div
                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg ring-2 ring-white dark:ring-slate-700 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setActiveTab('profile')}
                            title="Go to Profile"
                        >
                            {adminInfo?.userId?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300">
                    <div className="max-w-7xl mx-auto animate__animated animate__fadeInUp animate__faster">
                        {activeTab === "dashboard" && <OverviewTab adminInfo={adminInfo} stats={stats} setActiveTab={setActiveTab} />}
                        {activeTab === "profile" && <ProfileTab adminInfo={adminInfo} />}
                        {activeTab === "students" && <StudentsTab />}
                        {activeTab === "book-upload" && <NotesUpload />}
                        {activeTab === "pyq-upload" && <PYQUpload />}
                        {activeTab === "notifications" && <NotificationsManager />}
                        {activeTab === "admin" && (
                            <AdminManagement adminInfo={adminInfo} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Recharts Import (Add to top of file in next step)
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// colors for 3 categories
const COLORS = ['#7F2F9F', '#CE8CA5', '#4F46E5'];

function OverviewTab({ adminInfo, stats, setActiveTab }) {
    // Fallback data
    const metrics = stats?.metrics || { totalStudents: 0, activeToday: 0, totalNotes: 0, pendingRequests: 0 };
    const enrollmentData = stats?.charts?.enrollment || [];

    // Use backend data if available, otherwise fallback to reasonable placeholders
    let contentData = stats?.charts?.contentDistribution;

    // Only use fallback if the data is genuinely missing or empty
    if (!contentData || contentData.length === 0) {
        contentData = [
            { name: 'Notes', value: metrics.totalNotes || 0 },
            { name: 'PYQs', value: 0 },
            { name: 'Tests', value: 0 }
        ];
    } else {
        // Ensure "Notes" is present even if backend sent partial data
        const notesEntry = contentData.find(d => d.name === 'Notes');
        if (!notesEntry) {
            contentData = [
                { name: 'Notes', value: metrics.totalNotes || 0 },
                ...contentData
            ];
        }
    }
    const recentAdmissions = stats?.recentAdmissions || [];

    return (
        <div className="space-y-8 animate__animated animate__fadeIn">
            {/* 1. Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={Users} label="Total Students" value={metrics.totalStudents.toLocaleString()} change="+5%" color="text-brand-primary" />
                <MetricCard icon={Activity} label="Active Today" value={metrics.activeToday.toLocaleString()} color="text-brand-accent" />
                <MetricCard icon={FileText} label="Total Notes" value={metrics.totalNotes.toLocaleString()} color="text-brand-primary" />
                <MetricCard icon={Bell} label="Pending Requests" value={metrics.pendingRequests} color="text-danger" />
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Enrollment Trend (2/3 width) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Student Enrollment Trends (Cumulative)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={enrollmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Line type="monotone" dataKey="students" stroke="#7F2F9F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Content Distribution (1/3 width) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 font-bold text-slate-800 dark:text-white">
                    <h3 className="text-lg font-bold mb-4">Content Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={contentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {contentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-800 dark:text-gray-200 font-medium ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Quick Actions (Relocated) */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Zap className="text-blue-500" /> Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={BookOpen} title="Upload Notes" description="Share materials" color="bg-purple-600 dark:bg-purple-500" delay="delay-0" onClick={() => setActiveTab('book-upload')} />
                    <StatCard icon={FileText} title="Upload PYQ" description="Add questions" color="bg-pink-600 dark:bg-pink-500" delay="delay-100" onClick={() => setActiveTab('pyq-upload')} />
                    <StatCard icon={Bell} title="Send Notifications" description="Notify users" color="bg-purple-600 dark:bg-purple-500" delay="delay-300" onClick={() => setActiveTab('notifications')} />
                </div>
            </div>

            {/* 4. Recent Activity Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Admissions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {recentAdmissions.length > 0 ? recentAdmissions.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{u.name}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.course}</td>
                                    <td className="px-6 py-4 text-slate-500">{u.date}</td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{u.status}</span></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No recent admissions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, change, color }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h4>
                {change && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">{change}</span>}
            </div>
            <div className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, title, description, color, delay, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/50 dark:backdrop-blur-md border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer animate__animated animate__fadeInUp ${delay}`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-20 dark:opacity-10 group-hover:opacity-30 transition-opacity duration-500 transform group-hover:rotate-12 group-hover:scale-125`}>
                <Icon size={80} className="text-slate-900 dark:text-white" />
            </div>
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <Icon size={28} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{description}</p>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );
}

function ProfileTab({ adminInfo }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="px-6 pb-6 text-center -mt-12 relative">
                        <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-900 rounded-full p-1 shadow-lg transition-colors duration-300">
                            <div className="w-full h-full bg-slate-900 dark:bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold">
                                {adminInfo?.userId?.name?.charAt(0).toUpperCase() || "A"}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-4">{adminInfo?.userId?.name || "Master Admin"}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{adminInfo?.userId?.email || "admin@example.com"}</p>

                        <div className="flex justify-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize border border-blue-200">
                                {adminInfo?.role?.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <Mail size={18} className="text-blue-500" />
                                <span className="text-sm font-medium">{adminInfo?.userId?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <Shield size={18} className="text-purple-500" />
                                <span className="text-sm font-medium capitalize">{adminInfo?.role} Privileges</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permissions & Details */}
            <div className="md:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-8 transition-colors duration-300">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Shield className="text-emerald-500" /> Access & Permissions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PermissionItem
                            name="Upload Notes"
                            allowed={adminInfo?.permissions?.uploadNotes}
                        />
                        <PermissionItem name="Upload PYQ" allowed={adminInfo?.permissions?.uploadPYQ} />
                        <PermissionItem
                            name="Manage Events"
                            allowed={adminInfo?.permissions?.manageEvents}
                        />
                        <PermissionItem
                            name="Send Notifications"
                            allowed={adminInfo?.permissions?.sendNotifications}
                        />
                        <PermissionItem
                            name="Manage Admins"
                            allowed={adminInfo?.permissions?.manageAdmins}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudentsTab() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState(null); // null | '9' | '10'

    // Analytics Modal State
    const [selectedUserForAnalytics, setSelectedUserForAnalytics] = useState(null);
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await API.get("/admin/users");
            if (data.success) {
                setStudents(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch students", err);
            toast.error("Could not load students");
        } finally {
            setLoading(false);
        }
    }

    const fetchUserAnalytics = async (userId) => {
        try {
            setAnalyticsLoading(true);
            const response = await API.get(`/admin/users/${userId}/analytics`);
            if (response.data.success) {
                setUserAnalytics(response.data.data);
                setSelectedUserForAnalytics(userId);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to load user analytics");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const closeAnalyticsModal = () => {
        setSelectedUserForAnalytics(null);
        setUserAnalytics(null);
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    // State 1: Class Selection
    if (!selectedClass) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 animate__animated animate__fadeIn">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Class</h2>
                <p className="text-slate-500 mb-10">Choose a class to view student profiles</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                    {/* Class 9 Card */}
                    <div
                        onClick={() => setSelectedClass('9')}
                        className="group relative overflow-hidden bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-10 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-blue-200"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen size={120} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Class 9th</h3>
                        <p className="text-slate-500 dark:text-slate-400">View and manage students enrolled in Class 9.</p>
                        <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                            View Students <ChevronRight size={20} />
                        </div>
                    </div>

                    {/* Class 10 Card */}
                    <div
                        onClick={() => setSelectedClass('10')}
                        className="group relative overflow-hidden bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-10 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-purple-200"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GraduationCap size={120} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap size={40} />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Class 10th</h3>
                        <p className="text-slate-500 dark:text-slate-400">View and manage students enrolled in Class 10.</p>
                        <div className="mt-6 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                            View Students <ChevronRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // State 2: Student Grid
    const filteredStudents = students.filter(s =>
        s.class == selectedClass &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate__animated animate__fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900/50 dark:backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedClass(null)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        title="Back to Class Selection"
                    >
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <GraduationCap className={selectedClass === '10' ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"} />
                        Class {selectedClass}th Students
                        <span className="text-sm font-normal text-slate-400">({filteredStudents.length})</span>
                    </h2>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={30} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No students found</h3>
                    <p className="text-slate-400">No students enrolled in Class {selectedClass} matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStudents.map((student) => (
                        <div
                            key={student._id}
                            onClick={() => window.open(`/admin/users/${student._id}/analytics`, '_blank')}
                            className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer relative overflow-hidden"
                        >
                            {student.profilePicture ? (
                                <img
                                    src={`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api").replace('/api', '')}${student.profilePicture}`}
                                    alt={student.name}
                                    className="w-20 h-20 rounded-full object-cover mb-4 shadow-md group-hover:scale-110 transition-transform bg-slate-100"
                                />
                            ) : (
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedClass === '10' ? "from-purple-100 to-pink-100 text-purple-600" : "from-blue-100 to-cyan-100 text-blue-600"} flex items-center justify-center text-2xl font-bold mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{student.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{student.email}</p>

                            <div className="w-full grid grid-cols-2 gap-2 text-sm mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                    <span className="block text-slate-400 text-xs">Class</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{student.class}th</span>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                    <span className="block text-amber-500/80 text-xs">Streak</span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-500">🔥 {student.streak || 0}</span>
                                </div>
                            </div>

                            <div className="w-full pt-3 border-t border-slate-50 dark:border-slate-800 mt-auto">
                                <span className="text-xs font-semibold text-blue-500 dark:text-blue-400 flex items-center justify-center gap-1 group-hover:text-blue-600">
                                    <Activity size={14} /> View Analytics
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Analytics Modal */}
            {selectedUserForAnalytics && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate__animated animate__fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate__animated animate__zoomIn animate__faster relative">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    Student Report: {userAnalytics?.user?.name}
                                </h3>
                                <p className="text-sm text-slate-500">{userAnalytics?.user?.email}</p>
                            </div>
                            <button onClick={closeAnalyticsModal} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {analyticsLoading ? (
                            <div className="p-20 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="p-8 space-y-8">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <BookOpen className="text-blue-600" size={24} />
                                            <h4 className="font-semibold text-slate-700">Notes Read</h4>
                                        </div>
                                        <p className="text-4xl font-bold text-blue-700">
                                            {userAnalytics?.progress?.reduce((acc, curr) => acc + (curr.notesRead || 0), 0) || 0}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="text-purple-600" size={24} />
                                            <h4 className="font-semibold text-slate-700">Lectures Watched</h4>
                                        </div>
                                        <p className="text-4xl font-bold text-purple-700">
                                            {userAnalytics?.progress?.reduce((acc, curr) => acc + (curr.lecturesWatched || 0), 0) || 0}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <User className="text-emerald-600" size={24} />
                                            <h4 className="font-semibold text-slate-700">Quizzes Taken</h4>
                                        </div>
                                        <p className="text-4xl font-bold text-emerald-700">
                                            {userAnalytics?.quizAttempts?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Quiz History */}
                                <div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Activity size={20} className="text-blue-500" /> Quiz History
                                    </h4>
                                    {userAnalytics?.quizAttempts?.length === 0 ? (
                                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                            <p className="text-slate-400">No quizzes taken yet.</p>
                                        </div>
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
    )
}

// Sub-component for individual quiz attempt
const QuizAttemptCard = ({ attempt }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50">
            <div
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <h5 className="font-bold text-slate-800 dark:text-white">{attempt.quiz?.title || attempt.topic}</h5>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(attempt.startTime).toLocaleDateString()} • Score:
                        <span className={`font-bold ml-1 ${attempt.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : attempt.score >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            {Math.round(attempt.score)}%
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {expanded && (
                <div className="mt-4 border-t border-slate-100 pt-4 space-y-3 animate__animated animate__fadeIn">
                    <h6 className="text-sm font-semibold text-slate-700">Detailed Report:</h6>
                    {attempt.answers?.filter(a => !a.isCorrect).length === 0 ? (
                        <p className="text-emerald-600 text-sm font-medium bg-emerald-50 p-2 rounded-lg">🎉 Perfect score! No incorrect answers.</p>
                    ) : (
                        <div className="space-y-2">
                            {attempt.answers?.map((ans, idx) => (
                                !ans.isCorrect && (
                                    <div key={idx} className="bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                                        <p className="font-semibold text-slate-800 mb-1">Q {ans.questionIndex + 1}</p>
                                        <div className="flex gap-2">
                                            <span className="text-red-500 font-medium">Wrong:</span>
                                            <span className="text-slate-600">{ans.selectedAnswer}</span>
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

function PermissionItem({ name, allowed }) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${allowed ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800" : "bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-800"} transition-all hover:shadow-md`}>
            <span className={`font-medium ${allowed ? "text-emerald-800 dark:text-emerald-400" : "text-red-800 dark:text-red-400"}`}>{name}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${allowed ? "bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400"}`}>
                {allowed ? "✓" : "✕"}
            </div>
        </div>
    );
}

// Compact Clock Widget for Header
function ClockWidgetCompact() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (num) => String(num).padStart(2, "0");
    const hours = time.getHours() % 12 || 12;
    const minutes = formatTime(time.getMinutes());
    const ampm = time.getHours() >= 12 ? 'PM' : 'AM';

    return (
        <div className="flex items-center gap-3 text-slate-800 dark:text-white">
            <Clock size={18} className="text-brand-indigo dark:text-brand-rose" />
            <span className="text-xl font-bold font-mono tracking-widest">
                {hours}:{minutes} <span className="text-xs font-sans text-slate-500 dark:text-slate-400">{ampm}</span>
            </span>
            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1"></div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
        </div>
    );
}

export default AdminDashboard;
