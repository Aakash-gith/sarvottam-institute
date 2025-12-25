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
    User,
    MessageSquare,
    Camera,
    Trash2,
    Loader2,
    Layers
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
import AdminChat from "../../components/admin/AdminChat";
import AdminCourses from "../../components/admin/AdminCourses";
import ClockWidget from "../../components/clock-01";
import ThemeToggle from "../../components/ThemeToggle";
import logo from "../../assets/logo.png";
import "../../components/Sidebar.css"; // Import shared Sidebar styles

function AdminDashboard() {
    const [adminInfo, setAdminInfo] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [activeCategory, setActiveCategory] = useState("manage");
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getProfilePictureUrl = () => {
        if (!adminInfo?.userId?.profilePicture) return null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${adminInfo.userId.profilePicture}`;
    };

    const fetchAdminInfo = async () => {
        try {
            const { data } = await API.get("/admin/info");
            if (data.success) {
                setAdminInfo(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin info:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                handleLogout();
            }
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await API.get("/admin/dashboard-stats");
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        }
    };

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchAdminInfo(), fetchStats()]);
            } catch (err) {
                console.error("Dashboard init error:", err);
            } finally {
                setLoading(false);
            }
        };
        initDashboard();
    }, []);

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

    const categoryMenus = {
        manage: {
            title: "Overview",
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
                { id: 'courses', label: 'Courses', icon: Layers, visible: true },
                { id: 'chat', label: 'Support Chat', icon: MessageSquare, visible: true },
            ]
        },
        users: {
            title: "User Management",
            items: [
                { id: 'students', label: 'Students', icon: GraduationCap, visible: true },
                { id: 'admin', label: 'Admins', icon: Shield, visible: adminInfo?.role === 'master_admin' },
            ]
        },
        content: {
            title: "Content Control",
            items: [
                { id: 'book-upload', label: 'Notes Upload', icon: Upload, visible: adminInfo?.permissions?.uploadNotes },
                { id: 'pyq-upload', label: 'PYQ Upload', icon: FileText, visible: adminInfo?.permissions?.uploadPYQ },
                { id: 'notifications', label: 'Notifications', icon: Bell, visible: adminInfo?.permissions?.sendNotifications },
            ]
        },
        system: {
            title: "System Settings",
            items: [
                { id: 'profile', label: 'My Profile', icon: User, visible: true },
            ]
        }
    };

    // Helper to get active items for current category
    const currentCategoryItems = categoryMenus[activeCategory]?.items.filter(item => item.visible) || [];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (isMobile) setIsMobileOpen(false);
    };

    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        if (isMobile) {
            // If it's a direct link to dashboard, close menu
            if (catId === 'manage') {
                // but usually user wants to see the submenu items on mobile?
                // The current design shows a submenu in 'right' pane.
                // So on mobile, clicking a category should stay in menu but update 'right' pane items.
            }
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-poppins selection:bg-blue-500 selection:text-white overflow-hidden">
            {/* Mobile Hamburger Button */}
            {isMobile && !isMobileOpen && (
                <button
                    className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    onClick={() => setIsMobileOpen(true)}
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Mobile Backdrop */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`sidebar ${isSidebarExpanded ? 'expanded' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
                onMouseLeave={() => setIsSidebarExpanded(false)}
            >
                {/* LEFT PANE (Categories) */}
                <div className="left">
                    <img
                        src={logo}
                        alt="Sarvottam"
                        className="sidebar-brand-logo"
                        onClick={() => { setActiveTab('dashboard'); if (isMobile) setIsMobileOpen(false); }}
                        onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                    />

                    <button
                        className={activeCategory === "manage" ? "active" : ""}
                        onClick={() => handleCategoryClick("manage")}
                        onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                        title="Overview"
                    >
                        <LayoutDashboard size={22} />
                    </button>

                    <button
                        className={activeCategory === "users" ? "active" : ""}
                        onClick={() => handleCategoryClick("users")}
                        onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                        title="Users"
                    >
                        <Users size={22} />
                    </button>

                    <button
                        className={activeCategory === "content" ? "active" : ""}
                        onClick={() => handleCategoryClick("content")}
                        onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                        title="Content"
                    >
                        <BookOpen size={22} />
                    </button>



                    <div className="bottom-actions">
                        {/* User Profile Picture (Mini) */}
                        {adminInfo?.userId?.profilePicture ? (
                            <img
                                src={getProfilePictureUrl()}
                                alt="Profile"
                                className="user-avatar-mini"
                                onClick={() => setIsProfileModalOpen(true)}
                                onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                                title="View Profile Picture"
                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--primary, #0fb4b3)' }}
                            />
                        ) : (
                            <div
                                className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg cursor-pointer"
                                onClick={() => { setActiveTab('profile'); if (isMobile) setIsMobileOpen(false); }}
                                onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                            >
                                {adminInfo?.userId?.name?.charAt(0).toUpperCase() || "A"}
                            </div>
                        )}


                        <button
                            onClick={handleLogout}
                            onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                            title="Logout"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>

                {/* RIGHT PANE (Menu Items) */}
                <div
                    className="right"
                    onMouseEnter={() => !isMobile && setIsSidebarExpanded(true)}
                >
                    <div className="flex items-center justify-between pr-4 mt-[42px] mb-[24px]">
                        <h1 className="!m-0 !pl-6 !w-auto">
                            {categoryMenus[activeCategory]?.title}
                        </h1>
                        {isMobile && (
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>
                    <nav className="buttons">
                        {currentCategoryItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    className={activeTab === item.id ? "active" : ""}
                                    onClick={() => handleTabChange(item.id)}
                                >
                                    <div className="icon-box">
                                        <Icon size={20} />
                                    </div>
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* --- MAIN CONTENT (Shifted Right) --- */}
            <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[80px] pt-16 lg:pt-0 transition-all duration-300">


                <main className={`flex-1 flex flex-col min-h-0 ${activeTab === 'chat' ? 'p-0 lg:p-8' : 'p-4 lg:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300'}`}>
                    <div className={`${activeTab === 'chat' ? 'flex-1 flex flex-col overflow-hidden' : 'max-w-7xl mx-auto w-full'}`}>

                        {/* Inline Page Header (Replaces the horizontal navbar) */}
                        {activeTab !== 'chat' && (
                            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                                        {activeTab.replace('-', ' ')}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                                        Manage and monitor your {activeTab.replace('-', ' ')} metrics.
                                    </p>
                                </div>

                                <div className="hidden md:flex items-center gap-6 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <ClockWidgetCompact />
                                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                                    <ThemeToggle />
                                </div>
                            </div>
                        )}

                        {/* Content rendering based on active tab */}
                        <div className={`animate__animated animate__fadeInUp animate__faster ${activeTab === 'chat' ? 'flex-1 flex flex-col min-h-0' : ''}`}>
                            {activeTab === "dashboard" && <OverviewTab adminInfo={adminInfo} stats={stats} setActiveTab={setActiveTab} />}
                            {activeTab === "profile" && <ProfileTab adminInfo={adminInfo} onUpdate={fetchAdminInfo} />}
                            {activeTab === "students" && <StudentsTab isMobile={isMobile} />}
                            {activeTab === "book-upload" && <NotesUpload />}
                            {activeTab === "pyq-upload" && <PYQUpload />}
                            {activeTab === "notifications" && <NotificationsManager />}
                            {activeTab === "chat" && <AdminChat />}
                            {activeTab === "courses" && <AdminCourses />}
                            {activeTab === "admin" && (
                                <AdminManagement adminInfo={adminInfo} />
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Profile Picture Modal */}
            {isProfileModalOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsProfileModalOpen(false)}
                >
                    <div className="relative max-w-lg w-full bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <img
                            src={getProfilePictureUrl()}
                            alt="Profile Full Size"
                            className="w-full h-auto rounded-xl object-contain max-h-[80vh]"
                        />
                        <button
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                            onClick={() => setIsProfileModalOpen(false)}
                        >
                            <LogOut size={20} className="rotate-180" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Compact Clock for Header
function ClockWidgetCompact() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono text-sm">
            <Clock size={16} className="text-blue-500" />
            <span>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
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

function ProfileTab({ adminInfo, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const getProfilePictureUrl = () => {
        if (!adminInfo?.userId?.profilePicture) return null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${adminInfo.userId.profilePicture}`;
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        // Check file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("profilePicture", file);

        setUploading(true);
        try {
            const response = await API.post("/user/upload-profile-picture", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.success) {
                toast.success("Profile picture updated!");
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePicture = async () => {
        if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

        setUploading(true);
        try {
            const response = await API.delete("/user/remove-profile-picture");
            if (response.data.success) {
                toast.success("Profile picture removed");
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error("Removal failed:", error);
            toast.error("Failed to remove profile picture");
        } finally {
            setUploading(false);
        }
    };

    const profilePic = getProfilePictureUrl();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="px-6 pb-6 text-center -mt-12 relative">
                        <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-900 rounded-full p-1 shadow-lg transition-colors duration-300 relative group">
                            {profilePic ? (
                                <img src={profilePic} alt="Admin" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-900 dark:bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold">
                                    {adminInfo?.userId?.name?.charAt(0).toUpperCase() || "A"}
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer" onClick={handleUploadClick}>
                                <div className="p-1.5 bg-white text-slate-900 rounded-full hover:bg-blue-50 transition-colors" title="Upload Photo">
                                    <Camera size={16} />
                                </div>
                                {profilePic && (
                                    <div
                                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        title="Remove Photo"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemovePicture();
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </div>
                                )}
                            </div>

                            {uploading && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 rounded-full flex items-center justify-center z-10">
                                    <Loader2 className="animate-spin text-blue-500" size={24} />
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

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

function StudentsTab({ isMobile }) {
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
                        className="group relative overflow-hidden bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 lg:p-10 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-blue-200"
                    >
                        <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen size={isMobile ? 80 : 120} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="w-14 h-14 lg:w-20 lg:h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen size={isMobile ? 28 : 40} />
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-2">Class 9th</h3>
                        <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400">View and manage students enrolled in Class 9.</p>
                        <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                            View Students <ChevronRight size={20} />
                        </div>
                    </div>

                    {/* Class 10 Card */}
                    <div
                        onClick={() => setSelectedClass('10')}
                        className="group relative overflow-hidden bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 lg:p-10 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-purple-200"
                    >
                        <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GraduationCap size={isMobile ? 80 : 120} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="w-14 h-14 lg:w-20 lg:h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap size={isMobile ? 28 : 40} />
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-2">Class 10th</h3>
                        <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400">View and manage students enrolled in Class 10.</p>
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
                    {filteredStudents.map((student) => (
                        <div
                            key={student._id}
                            onClick={() => window.open(`/admin/users/${student._id}/analytics`, '_blank')}
                            className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-3 lg:p-6 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer relative overflow-hidden"
                        >
                            {student.profilePicture ? (
                                <img
                                    src={`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api").replace('/api', '')}${student.profilePicture}`}
                                    alt={student.name}
                                    className="w-12 h-12 lg:w-20 lg:h-20 rounded-full object-cover mb-2 lg:mb-4 shadow-md group-hover:scale-110 transition-transform bg-slate-100"
                                />
                            ) : (
                                <div className={`w-12 h-12 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br ${selectedClass === '10' ? "from-purple-100 to-pink-100 text-purple-600" : "from-blue-100 to-cyan-100 text-blue-600"} flex items-center justify-center text-lg lg:text-2xl font-bold mb-2 lg:mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h3 className="text-sm lg:text-lg font-bold text-slate-800 dark:text-white mb-0.5 lg:mb-1 line-clamp-1">{student.name}</h3>
                            <p className="text-[10px] lg:text-sm text-slate-500 dark:text-slate-400 mb-2 lg:mb-3 line-clamp-1">{student.email}</p>

                            <div className="w-full grid grid-cols-2 gap-1 lg:gap-2 text-[10px] lg:text-sm mb-2 lg:mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-1 lg:p-2 rounded-lg">
                                    <span className="block text-slate-400 text-[8px] lg:text-xs">Class</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{student.class}th</span>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-1 lg:p-2 rounded-lg">
                                    <span className="block text-amber-500/80 text-[8px] lg:text-xs">Streak</span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-500">🔥 {student.streak || 0}</span>
                                </div>
                            </div>

                            <div className="w-full pt-2 lg:pt-3 border-t border-slate-50 dark:border-slate-800 mt-auto">
                                <span className="text-[10px] lg:text-xs font-semibold text-blue-500 dark:text-blue-400 flex items-center justify-center gap-1 group-hover:text-blue-600">
                                    <Activity size={isMobile ? 12 : 14} /> Analytics
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Analytics Modal */}
            {selectedUserForAnalytics && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 lg:p-4 animate__animated animate__fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate__animated animate__zoomIn animate__faster relative">
                        <div className="p-4 lg:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
                            <div className="flex items-start gap-3 min-w-0 flex-1 mr-4">
                                <button
                                    onClick={closeAnalyticsModal}
                                    className="mt-0.5 p-1 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                                >
                                    <ChevronLeft size={isMobile ? 24 : 28} />
                                </button>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base lg:text-xl font-bold text-slate-800 dark:text-white truncate">
                                        Student Report: {userAnalytics?.user?.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 min-w-0">
                                        <span className="shrink-0 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[8px] lg:text-xs font-bold uppercase whitespace-nowrap">
                                            Class {userAnalytics?.user?.class || selectedClass}
                                        </span>
                                        <p className="text-[9px] lg:text-sm text-slate-500 dark:text-slate-400 truncate min-w-0">
                                            {userAnalytics?.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeAnalyticsModal} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors shrink-0">
                                <X size={isMobile ? 20 : 24} />
                            </button>
                        </div>

                        {analyticsLoading ? (
                            <div className="p-12 lg:p-20 flex justify-center">
                                <div className="animate-spin rounded-full h-10 lg:h-12 w-10 lg:w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="p-4 lg:p-8 space-y-4 lg:space-y-8">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-3 gap-2 lg:gap-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 lg:p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 mb-1 lg:mb-2">
                                            <BookOpen className="text-blue-600 dark:text-blue-400" size={isMobile ? 16 : 24} />
                                            <h4 className="text-[10px] lg:text-base font-semibold text-slate-700 dark:text-slate-300">Notes</h4>
                                        </div>
                                        <p className="text-xl lg:text-4xl font-bold text-blue-700 dark:text-blue-300">
                                            {userAnalytics?.progress?.reduce((acc, curr) => acc + (curr.notesRead || 0), 0) || 0}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 lg:p-6 rounded-2xl border border-purple-100 dark:border-purple-800">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 mb-1 lg:mb-2">
                                            <Clock className="text-purple-600 dark:text-purple-400" size={isMobile ? 16 : 24} />
                                            <h4 className="text-[10px] lg:text-base font-semibold text-slate-700 dark:text-slate-300">Videos</h4>
                                        </div>
                                        <p className="text-xl lg:text-4xl font-bold text-purple-700 dark:text-purple-300">
                                            {userAnalytics?.progress?.reduce((acc, curr) => acc + (curr.lecturesWatched || 0), 0) || 0}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 lg:p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 mb-1 lg:mb-2">
                                            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={isMobile ? 16 : 24} />
                                            <h4 className="text-[10px] lg:text-base font-semibold text-slate-700 dark:text-slate-300">Quizzes</h4>
                                        </div>
                                        <p className="text-xl lg:text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                                            {userAnalytics?.quizAttempts?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Quiz History */}
                                <div>
                                    <h4 className="text-base lg:text-lg font-bold text-slate-800 dark:text-white mb-3 lg:mb-4 flex items-center gap-2">
                                        <Activity size={isMobile ? 18 : 20} className="text-blue-500" /> Quiz History
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
        <div className="border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 lg:p-4 hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50">
            <div
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <h5 className="font-bold text-sm lg:text-base text-slate-800 dark:text-white">{attempt.quiz?.title || attempt.topic}</h5>
                    <p className="text-[10px] lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5 lg:mt-1">
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


export default AdminDashboard;
