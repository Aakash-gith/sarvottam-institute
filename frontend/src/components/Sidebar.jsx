import React, { useState, useEffect } from "react";
import {
    Home,
    BookOpen,
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
    X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import API from "../api/axios";
import "./Sidebar.css";
import logo from "../assets/logo.png";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { userData, status: isLoggedIn } = useSelector((state) => state.auth.userData);
    const [profilePicture, setProfilePicture] = useState(null);

    // State to track which category is selected on the left
    const [activeCategory, setActiveCategory] = useState("home");
    const [isExpanded, setIsExpanded] = useState(false);

    /* State for Mobile Responsiveness */
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    /* State for Profile Image Modal */
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Fetch profile picture
    useEffect(() => {
        const fetchProfilePicture = async () => {
            if (!isLoggedIn) return;
            try {
                const response = await API.get("/user/profile-picture");
                if (response.data.success) {
                    setProfilePicture(response.data.data.profilePicture);
                }
            } catch (error) {
                console.error("Failed to fetch profile picture:", error);
            }
        };
        fetchProfilePicture();
    }, [isLoggedIn, userData]);

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
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${profilePicture}`;
    };

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/auth/login", { replace: true });
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
                { name: "PYQ", icon: FileText, path: "/pyq" },
                { name: "Imp. Ques", icon: Star, path: "/important-questions" },
                { name: "Quiz", icon: Brain, path: "/quiz" },
                { name: "NCERT Sol", icon: Book, path: "/ncert-solutions" },
                { name: "Exemplar", icon: Bookmark, path: "/ncert-exemplar" },
                { name: "Books", icon: Library, path: "/books" },
                { name: "Video Learning", icon: MonitorPlay, path: "/video-learning" },
            ]
        },
        // Settings / Extra category if needed, for now just these two main ones + profile link implies analytics
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        if (category === "home") {
            navigate("/");
            if (isMobile) setIsMobileOpen(false);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) setIsMobileOpen(false);
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
            {isMobile && !isMobileOpen && location.pathname !== '/chat' && (
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
                className={`sidebar ${isExpanded ? 'expanded' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
                onMouseLeave={handleMouseLeave}
            >
                {/* --- LEFT PANE (Categories) --- */}
                <div className="left">
                    {/* Institute Logo */}
                    <img
                        src={logo}
                        alt="Sarvottam Institute"
                        className="sidebar-brand-logo"
                        onClick={() => { navigate('/'); if (isMobile) setIsMobileOpen(false); }}
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

                    {/* Bottom Actions */}
                    <div className="bottom-actions">
                        {/* User Profile Picture (Mini) */}
                        {isLoggedIn && profilePicture && (
                            <img
                                src={getProfilePictureUrl()}
                                alt="Profile"
                                className="user-avatar-mini"
                                onClick={() => setIsProfileModalOpen(true)}
                                onMouseEnter={handleMouseEnter}
                                title="View Profile Picture"
                            />
                        )}

                        <button
                            onClick={() => { navigate('/profile?view=settings'); if (isMobile) setIsMobileOpen(false); }}
                            onMouseEnter={handleMouseEnter}
                            title="Settings"
                        >
                            <Settings size={22} />
                        </button>
                        <button
                            onClick={isLoggedIn ? handleLogout : () => navigate('/auth/login')}
                            onMouseEnter={handleMouseEnter}
                            title={isLoggedIn ? "Logout" : "Login"}
                        >
                            {isLoggedIn ? <LogOut size={22} /> : <User size={22} />}
                        </button>
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
