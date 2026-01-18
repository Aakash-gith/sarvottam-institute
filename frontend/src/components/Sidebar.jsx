import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    Home,
    Bell,
    BookOpen,
    PlayCircle,
    Brain,
    Calendar,
    User,
    LogOut,
    FileText,
    Settings,
    Users,
    CheckSquare,
    PieChart,
    Star,
    Book,
    Bookmark,
    Library,
    GraduationCap,
    MessageSquare,
    MonitorPlay,
    Menu,
    X,
    Layers,
    LayoutGrid,
    HelpCircle,
    Info,
    Gamepad2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import API from "../api/axios";
import "./Sidebar.css";
import logo from "../assets/logo.png";
import defaultUser from "../assets/default-user.png";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { userData, status: isLoggedIn } = useSelector((state) => state.auth);
    // Use profile picture from Redux store directly
    const profilePicture = userData?.profilePicture;

    // State to track which category is selected on the left
    const [activeCategory, setActiveCategory] = useState("home");
    const [isExpanded, setIsExpanded] = useState(false);

    /* State for Mobile Responsiveness */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    /* State for Profile Image Modal */
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    /* Notification State */
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [unreadChats, setUnreadChats] = useState([]);

    // Refs for click outside
    const mobileNotifRef = React.useRef(null);
    const desktopNotifRef = React.useRef(null);
    const profileMenuRef = React.useRef(null);

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideMobile = mobileNotifRef.current ? !mobileNotifRef.current.contains(event.target) : true;
            const isOutsideDesktop = desktopNotifRef.current ? !desktopNotifRef.current.contains(event.target) : true;
            const isOutsideProfile = profileMenuRef.current ? !profileMenuRef.current.contains(event.target) : true;

            if (isNotificationsOpen && isOutsideMobile && isOutsideDesktop) {
                setIsNotificationsOpen(false);
            }
            if (showProfileMenu && isOutsideProfile) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isNotificationsOpen, showProfileMenu]);

    // Chat Notification Logic
    const [chatStates, setChatStates] = useState({}); // { [chatId]: unreadCount }

    useEffect(() => {
        if (!isLoggedIn) return;

        const pollMessages = async () => {
            try {
                const response = await API.get('/message/conversations');
                if (response.data.success) {
                    const chats = response.data.data;
                    const newChatStates = {};
                    let hasChanges = false;
                    let shouldNotify = Object.keys(chatStates).length > 0; // Don't notify on first load

                    chats.forEach(chat => {
                        const prevUnread = chatStates[chat.id] || 0;
                        const currentUnread = chat.unread || 0;

                        // Check for new messages (unread count increased)
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

                    // Only update state if unread counts changed/length diff to avoid unnecessary re-renders
                    if (hasChanges || Object.keys(chatStates).length !== chats.length) {
                        setChatStates(newChatStates);
                    }
                    setUnreadChats(chats.filter(c => c.unread > 0));
                }
            } catch (error) {
                // Silent error
            }
        };

        const interval = setInterval(pollMessages, 5000);
        return () => clearInterval(interval);
    }, [isLoggedIn, chatStates]);

    // Fetch System Notifications
    useEffect(() => {
        if (!isLoggedIn) return;
        const fetchSystemNotifications = async () => {
            try {
                const res = await API.get("/user/notifications");
                if (res.data.success) {
                    setSystemNotifications(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications");
            }
        };
        fetchSystemNotifications();
    }, [isLoggedIn, isNotificationsOpen]);

    const handleNotificationClick = async (item) => {
        setIsNotificationsOpen(false);
        if (item.type === 'chat') {
            navigate('/chat', { state: { selectedChatId: item.id } });
        } else {
            // System notification
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

    const unreadCountTotal = unreadChats.length + systemNotifications.filter(n => !n.readBy.includes(userData?._id)).length;

    // Sync active category with current path
    useEffect(() => {
        const path = location.pathname;
        if (
            path.startsWith('/notes') ||
            path.startsWith('/board-ready') ||
            path.startsWith('/exam-ready') ||
            path.startsWith('/important-questions') ||
            path.startsWith('/quiz') ||
            path.startsWith('/ncert') ||
            path.startsWith('/books') ||
            path.startsWith('/video-learning')
        ) {
            setActiveCategory("learning");
        } else if (path.startsWith('/courses')) {
            setActiveCategory("courses");
        } else {
            setActiveCategory("home");
        }
    }, [location.pathname]);

    // Handle Resize for Mobile Check
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileOpen(false); // Close mobile menu if switching to desktop
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getProfilePictureUrl = () => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http')) return profilePicture;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${profilePicture}`;
    };

    const handleLogout = () => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-amber-600">
                    <Info size={20} />
                    <span className="font-bold">Sign Out?</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to sign out?</p>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await performLogout();
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                        Yes, Sign Out
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: {
                background: 'var(--card, #fff)',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            }
        });
    };

    const performLogout = async () => {
        const loadingToast = toast.loading("Signing out...");
        try {
            const id = userData?._id;
            const token = localStorage.getItem("refreshToken");

            if (id && token) {
                await API.post("/auth/logout", { id, token });
            }

            dispatch(logout());
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate("/auth/login", { replace: true });
            toast.success("Logged out successfully", { id: loadingToast });
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(logout());
            localStorage.clear();
            navigate("/auth/login", { replace: true });
            toast.dismiss(loadingToast);
        }
    };

    // Define menus for the Right Panel based on Left Panel selection
    const menus = {
        home: {
            title: "Dashboard",
            items: [
                { name: "Chat", icon: MessageSquare, path: "/chat" },
                { name: "Tasks", icon: CheckSquare, path: "/events" },
                { name: "Analytics", icon: PieChart, path: "/profile?view=analytics" },
            ]
        },
        learning: {
            title: "Learning Hub",
            items: [
                { name: "Notes", icon: BookOpen, path: "/notes" },
                {
                    name: userData?.class == 9 ? "Exam Ready" : "Board Ready",
                    icon: FileText,
                    path: userData?.class == 9 ? "/exam-ready" : "/board-ready"
                },
                { name: "Imp. Ques", icon: Star, path: "/important-questions" },
                { name: "Quiz", icon: Brain, path: "/quiz" },
                { name: "NCERT Sol", icon: Book, path: "/ncert-solutions" },
                { name: "Exemplar", icon: Bookmark, path: "/ncert-exemplar" },
                { name: "Books", icon: Library, path: "/books" },
                { name: "Mastery Hub", icon: Gamepad2, path: "/mastery-hub" },
                { name: "Video Learning", icon: MonitorPlay, path: "/video-learning" },
            ]
        },
        courses: {
            title: "Courses",
            items: [
                { name: "My Batches", icon: BookOpen, path: "/my-courses" },
                { name: "Paid Batches", icon: Layers, path: "/courses?type=paid" },
                { name: "Free Batches", icon: PlayCircle, path: "/courses?type=free" },
            ]
        },
        // Settings / Extra category if needed, for now just these two main ones + profile link implies analytics
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        if (category === "home") {
            navigate("/");
            // Sidebar stays open on mobile
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        // Sidebar stays open on mobile
    };

    // Sidebar interaction handlers
    const handleMouseEnter = () => {
        if (!isMobile) setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        if (!isMobile) setIsExpanded(false);
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            {/* Mobile Hamburger Button & Bell */}
            {isMobile && !isMobileOpen && location.pathname !== '/chat' && (
                <>
                    <button
                        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <div ref={mobileNotifRef} className="absolute top-4 right-4 z-50">
                        <button
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 relative"
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        >
                            <Bell size={24} />
                            {unreadCountTotal > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                    <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto">
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
                                        <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
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
                </>
            )}

            {/* Mobile Backdrop */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`sidebar ${isExpanded ? 'expanded' : ''} ${isMobileOpen ? 'mobile-open' : ''} ${showProfileMenu ? 'profile-menu-visible' : ''}`}
                onMouseLeave={handleMouseLeave}
            >
                {/* --- LEFT PANE (Categories) --- */}
                <div className={`left ${showProfileMenu ? 'overflow-visible-important' : ''}`}>
                    {/* Institute Logo */}
                    <img
                        src={logo}
                        alt="Sarvottam Institute"
                        className="sidebar-brand-logo"
                        onMouseEnter={handleMouseEnter}
                    />

                    {/* Category Buttons */}
                    <button
                        className={activeCategory === "home" ? "active" : ""}
                        onClick={() => handleCategoryClick("home")}
                        onMouseEnter={handleMouseEnter}
                        title="Home"
                    >
                        <Home size={22} />
                    </button>

                    <button
                        className={activeCategory === "learning" ? "active" : ""}
                        onClick={() => handleCategoryClick("learning")}
                        onMouseEnter={handleMouseEnter}
                        title="Learning"
                    >
                        <GraduationCap size={24} />
                    </button>

                    <button
                        className={activeCategory === "courses" ? "active" : ""}
                        onClick={() => handleCategoryClick("courses")}
                        onMouseEnter={handleMouseEnter}
                        title="Courses"
                    >
                        <Layers size={24} />
                    </button>

                    {/* Bottom Actions */}
                    <div className="bottom-actions relative" ref={profileMenuRef}>
                        {/* User Profile Picture (Mini) with Dropdown */}
                        {isLoggedIn && (
                            <div className="relative">
                                <img
                                    src={getProfilePictureUrl() || defaultUser}
                                    alt="Profile"
                                    className={`user-avatar-mini cursor-pointer transition-transform duration-200 ${showProfileMenu ? 'scale-110 ring-2 ring-blue-500 box-content' : ''}`}
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    // Removed modal open on click, now toggles menu
                                    onMouseEnter={handleMouseEnter}
                                    title="My Profile"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid var(--primary, #0fb4b3)'
                                    }}
                                />

                                {/* Profile Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className="absolute left-[calc(100%+12px)] bottom-0 profile-dropdown-menu border border-slate-100 dark:border-slate-800 z-[100] animate-in fade-in slide-in-from-left-2 duration-200 cursor-default">

                                        {/* 1. Header Section */}
                                        <div className="p-3 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                            <img
                                                src={getProfilePictureUrl() || defaultUser}
                                                alt="User"
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm">{userData?.name || "Student"}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userData?.email || ""}</p>
                                            </div>
                                        </div>

                                        {/* 2. Menu Items */}
                                        <div className="py-2 space-y-1">
                                            <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }} className="profile-menu-item">
                                                <User size={18} /> <span>Account</span>
                                            </button>
                                            <button onClick={() => { navigate('/profile?view=settings'); setShowProfileMenu(false); }} className="profile-menu-item">
                                                <Settings size={18} /> <span>Settings</span>
                                            </button>
                                            <button onClick={() => { navigate('/profile?view=guide'); setShowProfileMenu(false); }} className="profile-menu-item">
                                                <BookOpen size={18} /> <span>Guide</span>
                                            </button>
                                            <button onClick={() => { navigate('/profile?view=help'); setShowProfileMenu(false); }} className="profile-menu-item">
                                                <HelpCircle size={18} /> <span>Help</span>
                                            </button>
                                        </div>



                                        {/* 3. Sign Out */}
                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="profile-menu-item !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                                            >
                                                <LogOut size={18} /> <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Desktop notification bell - Hidden per request to move to dashboard */}
                        <div ref={desktopNotifRef} className="relative hidden">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                onMouseEnter={handleMouseEnter}
                                title="Notifications"
                                className="relative flex"
                            >
                                <Bell size={22} />
                                {unreadCountTotal > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
                            </button>

                            {/* Desktop Popover */}
                            {isNotificationsOpen && !isMobile && (
                                <div className="absolute left-full bottom-0 mb-[-12px] ml-4 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[60] animate-in fade-in slide-in-from-left-2">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                        <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                        <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
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
                                            <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
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


                    </div>
                </div>

                {/* --- RIGHT PANE (Dynamic Content) --- */}
                <div
                    className="right"
                    onMouseEnter={handleMouseEnter}
                >
                    <div className="flex items-center justify-between pr-4 mt-[42px] mb-[24px]">
                        <h1 className="!m-0 !w-auto">
                            {menus[activeCategory]?.title}
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
                        {menus[activeCategory]?.items.map((item) => {
                            const Icon = item.icon;
                            // Check if this item is 'active' based on current URL
                            const currentPath = location.pathname + location.search;
                            const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
                            return (
                                <button
                                    key={item.name}
                                    className={isActive ? "active" : ""}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <div className="icon-box">
                                        <Icon size={20} />
                                    </div>
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

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
        </>
    );
};

export default Sidebar;
