import React, { useState, useEffect, useRef } from "react";
import { Home, BookOpen, Brain, Calendar, Menu, X, User, LogOut, FileText, Bell, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import API from "../api/axios";
import logo from "../assets/logo.png";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const isLoggedIn = useSelector((state) => state.auth.status);

  // Fetch profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await API.get("/user/profile-picture");
        if (response.data.success) {
          setProfilePicture(response.data.data.profilePicture);
        }
      } catch (error) {
        console.error("Failed to fetch profile picture:", error);
      }
    };
    if (userData) {
      fetchProfilePicture();
    }
  }, [userData]);

  const getProfilePictureUrl = () => {
    if (!profilePicture) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${baseUrl}${profilePicture}`;
  };

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  // Click outside to close notifications
  const notificationRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);


  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/user/notifications");
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/user/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readBy: [...n.readBy, userData._id] } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };


  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/auth/login", { replace: true });
    setIsOpen(false);
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Learning", path: "/notes", icon: BookOpen },
    { name: "PYQ", path: "/pyq", icon: FileText },
    { name: "Quiz", path: "/quiz", icon: Brain },
    { name: "Task Planner", path: "/events", icon: Calendar },
    { name: "Profile", path: "/profile", icon: User, isProfile: true },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[var(--background)]/90 dark:bg-[rgba(15,34,61,0.92)] backdrop-blur-md border-b border-slate-200 dark:border-[var(--border)] shadow-sm z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Logo"
              className="h-11 w-11 object-contain rounded-full bg-white dark:bg-[var(--card)] p-1 border border-[var(--border)] shadow-sm"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-[var(--foreground)] whitespace-nowrap">Sarvottam Institute</span>
          </div>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-3 mx-4">
              {navItems.slice(0, -1).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? "text-[var(--brand-secondary)] dark:text-[#e8f4ff] bg-[rgba(15,180,179,0.15)] dark:bg-[rgba(37,201,199,0.18)] border border-[var(--brand-primary)] shadow-[0_6px_16px_-8px_rgba(15,180,179,0.8)]"
                        : "text-gray-600 dark:text-[var(--muted-foreground)] hover:text-[var(--brand-secondary)] hover:bg-[rgba(15,180,179,0.12)]"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4 flex-shrink-0">


            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/auth/login")}
                  className="hidden sm:block px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/auth/signup")}
                  className="hidden sm:block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                {/* User Profile Display */}
                <div className="hidden sm:flex items-center gap-3">

                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition relative"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border border-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-700">Notifications</h3>
                          <button onClick={fetchNotifications} className="text-xs text-blue-600 hover:underline">Refresh</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((note) => {
                              const isRead = note.readBy.some(id => id === userData?._id) || note.readBy.includes(userData?._id);
                              return (
                                <div
                                  key={note._id}
                                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition ${!isRead ? 'bg-blue-50/50' : ''}`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className={`text-sm font-medium ${!isRead ? 'text-blue-700' : 'text-gray-800'}`}>
                                      {note.title}
                                    </h4>
                                    {!isRead && (
                                      <button
                                        onClick={() => markAsRead(note._id)}
                                        title="Mark as read"
                                        className="text-gray-400 hover:text-blue-600"
                                      >
                                        <Check size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-3">{note.message}</p>
                                  <span className="text-[10px] text-gray-400 mt-2 block">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                              No notifications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <ThemeToggle />
                  {profilePicture ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border-2 border-blue-600 cursor-pointer hover:opacity-80"
                      onClick={() => navigate("/profile")}
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700"
                      onClick={() => navigate("/profile")}
                    >
                      <User size={18} />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{userData?.name?.split(" ")[0]}</p>
                    <p className="text-xs text-gray-500">Class {userData?.class === 9 ? "IX" : "X"}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium cursor-pointer"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-white z-30 md:hidden overflow-y-auto">
          <div className="p-4 space-y-2">
            {isLoggedIn && (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {item.isProfile && profilePicture ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-blue-600">
                          <img
                            src={getProfilePictureUrl()}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <Icon size={20} />
                      )}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition font-medium"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            )}
            {!isLoggedIn && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate("/auth/login");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/auth/signup");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
