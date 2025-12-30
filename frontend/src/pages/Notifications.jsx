import React, { useState, useEffect } from "react";
import {
    Bell,
    CheckCheck,
    Trash2,
    MessageSquare,
    BookOpen,
    AlertTriangle,
    Info,
    Calendar,
    ChevronLeft,
    Clock,
    Filter,
    Search,
    X,
    MoreHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import toast from "react-hot-toast";

// Helper function to format timestamp
const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 7) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (days > 1) {
        return `${days}d ago`;
    } else if (days === 1) {
        return "Yesterday";
    } else if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return "Just now";
    }
};

const getIconForType = (type) => {
    switch (type) {
        case 'chat': return <MessageSquare size={18} className="text-blue-500" />;
        case 'academic': return <BookOpen size={18} className="text-purple-500" />;
        case 'alert': return <AlertTriangle size={18} className="text-orange-500" />;
        case 'system': return <Info size={18} className="text-slate-500" />;
        case 'deadline': return <Calendar size={18} className="text-red-500" />;
        default: return <Bell size={18} className="text-slate-500" />;
    }
};

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Filter states
    const tabs = [
        { id: "all", label: "All" },
        { id: "unread", label: "Unread" },
        { id: "chat", label: "Chats" },
        { id: "academic", label: "Academic" },
        { id: "system", label: "System" },
    ];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // 1. Fetch System Notifications
            const systemRes = await API.get("/user/notifications");
            const systemNotifs = (systemRes.data.success ? systemRes.data.data : []).map(n => ({
                id: n._id,
                title: n.title,
                message: n.message,
                type: n.type || 'system',
                timestamp: n.createdAt,
                read: n.readBy && n.readBy.length > 0, // Assuming readBy stores user IDs
                link: null
            }));

            // 2. Fetch Unread Chats
            const chatRes = await API.get('/message/conversations');
            const chatNotifs = chatRes.data.success
                ? chatRes.data.data
                    .filter(c => c.unread > 0)
                    .map(c => ({
                        id: `chat-${c.id}`, // Unique ID for key
                        title: `Message from ${c.name}`,
                        message: c.lastMessage || "Sent a message",
                        type: 'chat',
                        timestamp: c.time ? (c.time === 'Now' ? new Date().toISOString() : new Date().toISOString()) : new Date().toISOString(), // Fallback for time
                        read: false,
                        link: '/chat', // Navigate to chat
                        chatId: c.id
                    }))
                : [];

            // 3. Mock Academic & Alerts (Since backend might not generate them yet)
            const dummyAcademic = [
                {
                    id: "ac-1",
                    title: "Math Test Uploaded",
                    message: "A new Maths test for Chapter 5 is now available.",
                    type: "academic",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    read: false,
                    link: "/quiz"
                },
                {
                    id: "ac-2",
                    title: "Physics Notes Added",
                    message: "New notes for 'Light: Reflection and Refraction' have been uploaded.",
                    type: "academic",
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    read: true,
                    link: "/notes"
                },
                {
                    id: "sys-1",
                    title: "Maintenance Scheduled",
                    message: "The system will be down for maintenance tonight at 2 AM.",
                    type: "alert",
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    read: true,
                    link: null
                }
            ];

            // Merge and Sort
            const allNotifs = [...systemNotifs, ...chatNotifs, ...dummyAcademic].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setNotifications(allNotifs);

        } catch (error) {
            console.error("Failed to fetch notifications", error);
            // toast.error("Failed to load notifications"); // Silent fail to avoid spam
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id, e) => {
        e?.stopPropagation();
        try {
            // Call API for system notifications
            if (!id.startsWith('ac-') && !id.startsWith('sys-')) { // Check if it's a real ID
                await API.put(`/user/notifications/${id}/read`);
            }

            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            toast.success("Marked as read");
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            // In real app, call API endpoint for "Mark all"
            // await API.put("/user/notifications/mark-all-read");

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleDelete = (id, e) => {
        e?.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Notification removed");
        // API call to delete logic would go here
    };

    const handleNavigate = (notification) => {
        if (!notification.read) handleMarkAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        } else if (notification.type === 'chat') {
            navigate('/chat');
        }
    };

    const filteredNotifications = notifications.filter(n => {
        // Tab Filter
        if (activeTab === "unread" && n.read) return false;
        if (activeTab !== "all" && activeTab !== "unread" && n.type !== activeTab) return false;

        // Search Filter
        if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.message.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        return true;
    });

    // Grouping logic
    const groupedNotifications = {
        Today: [],
        Yesterday: [],
        Earlier: []
    };

    filteredNotifications.forEach(n => {
        const date = new Date(n.timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            groupedNotifications.Today.push(n);
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupedNotifications.Yesterday.push(n);
        } else {
            groupedNotifications.Earlier.push(n);
        }
    });

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-poppins">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 md:ml-[80px] lg:ml-[100px] h-screen transition-all duration-300">
                {/* --- Sticky Header --- */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 md:px-8">
                    <div className="max-w-4xl mx-auto flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isMobile && (
                                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                                        <ChevronLeft size={24} />
                                    </button>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Notifications
                                        <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                            {notifications.filter(n => !n.read).length} New
                                        </span>
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <CheckCheck size={16} />
                                    <span className="hidden sm:inline">Mark all as read</span>
                                </button>
                            </div>
                        </div>

                        {/* Search & Tabs */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            {/* Tabs */}
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full sm:w-64 group">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- Scrollable Content --- */}
                <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 scroll-smooth">
                    <div className="max-w-4xl mx-auto space-y-8 pb-20">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="loader"></div>
                                <p className="text-slate-500 text-sm">Loading Updates...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Bell size={32} className="text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">All caught up!</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
                                    No notifications to display right now. Check back later for updates.
                                </p>
                            </div>
                        ) : (
                            Object.entries(groupedNotifications).map(([group, items]) => (
                                items.length > 0 && (
                                    <div key={group} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
                                            {group}
                                        </h2>
                                        <div className="space-y-3">
                                            {items.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => handleNavigate(notification)}
                                                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer
                                                        ${notification.read
                                                            ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                                            : "bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        }
                                                        hover:shadow-md
                                                    `}
                                                >
                                                    <div className="flex p-4 gap-4 items-start">
                                                        {/* Icon Box */}
                                                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${notification.read ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                                                            {getIconForType(notification.type)}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0 pt-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h3 className={`text-base font-semibold truncate pr-4 ${notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {formatTime(notification.timestamp)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm line-clamp-2 ${notification.read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                                {notification.message}
                                                            </p>
                                                        </div>

                                                        {/* Status Dot */}
                                                        {!notification.read && (
                                                            <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-blue-900 animate-pulse"></div>
                                                        )}
                                                    </div>

                                                    {/* Actions Overlay (Desktop Hover) */}
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-1 flex items-center gap-1 backdrop-blur-sm sm:flex hidden">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded-md"
                                                                title="Mark as read"
                                                            >
                                                                <CheckCheck size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(notification.id, e)}
                                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-md"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Mobile Swipe Indicators (Visual Cue Only) */}
                                                    <div className="sm:hidden absolute inset-y-0 right-0 w-1 bg-blue-500 opacity-0 group-active:opacity-100 transition-opacity" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
