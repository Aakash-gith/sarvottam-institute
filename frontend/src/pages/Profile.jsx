import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../components/Sidebar";
import {
  User, Edit2, Save, X, Trophy, Flame, Brain, Target,
  Calendar, TrendingUp, Award, BookOpen, Mail, GraduationCap,
  CheckCircle, XCircle, Clock, BarChart3, Camera, Upload, Trash2,
  ChevronUp, ChevronDown, Moon, Sun, ChevronRight, Bell, Shield, Settings,
  LogOut, LayoutGrid, HelpCircle, Lock, Globe, Eye, Smartphone, Laptop, Info, ChevronLeft,
  Video, Book, MessageSquare, ShieldCheck, Ticket, Plus, Loader2, Zap, PieChart
} from "lucide-react";
import API from "../api/axios";
import AnalyticsView from "../components/profile/AnalyticsView";
import { login, logout, updateUser } from "../store/authSlice";
import { toggleTheme, setTheme } from "../store/themeSlice";
import { toast } from "react-hot-toast";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeView = searchParams.get("view") || "account";
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const theme = useSelector((state) => state.theme.mode);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingClass, setSavingClass] = useState(false);
  const [editName, setEditName] = useState(userData?.name || "");
  const [editClass, setEditClass] = useState(userData?.class || 9);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPictureMenu, setShowPictureMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportStep, setSupportStep] = useState('choice'); // 'choice', 'ticket', 'email', 'success'
  const [myTickets, setMyTickets] = useState([]);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'General', description: '' });
  const [lastCreatedTicketId, setLastCreatedTicketId] = useState("");
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const pictureMenuRef = useRef(null);

  const [stats, setStats] = useState({
    totalQuizzes: 0,
    bestScore: 0,
    averageScore: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalQuestions: 0,
    totalXP: 0,
    recentQuizzes: [],
    quizzesByMonth: [],
    favoriteTopics: [],
    lastLogin: null,
    activeSessions: 0,
    notificationPrefs: { email: true, inApp: true },
    language: "English",
    privacy: { profileVisible: true, emailVisible: false }
  });

  // Close picture menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pictureMenuRef.current && !pictureMenuRef.current.contains(event.target)) {
        setShowPictureMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userData) {
      navigate("/auth/login", { replace: true });
      return;
    }
    fetchProfileStats();
    fetchTickets();
  }, [userData, navigate]);

  const fetchTickets = async () => {
    try {
      const response = await API.get("/support/my-tickets");
      if (response.data.success) {
        setMyTickets(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  const fetchProfileStats = async () => {
    try {
      const response = await API.get("/user/profile-stats");
      if (response.data.success) {
        setStats(response.data.data);
        setEditName(response.data.data.name || userData?.name || "");
        setProfilePicture(response.data.data.profilePicture || null);
        // Important: Update global userData with fetched preferences to prevent reset on refresh
        dispatch(updateUser({
          theme: response.data.data.theme,
          notificationPrefs: response.data.data.notificationPrefs,
          language: response.data.data.language,
          privacy: response.data.data.privacy
        }));
      }
    } catch (error) {
      console.error("Failed to fetch profile stats:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const response = await API.put("/user/update-name", { name: editName.trim() });
      if (response.data.success) {
        const updatedUser = { ...userData, name: editName.trim() };
        dispatch(login({
          user: updatedUser,
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken")
        }));
        toast.success("Name updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(userData?.name || "");
    setIsEditing(false);
  };

  const handleSaveClass = async () => {
    if (editClass !== 9 && editClass !== 10) {
      toast.error("Class must be either 9th or 10th");
      return;
    }

    setSavingClass(true);
    try {
      const response = await API.put("/user/update-class", { class: editClass });
      if (response.data.success) {
        const updatedUser = { ...userData, class: editClass };
        dispatch(login({
          user: updatedUser,
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken")
        }));
        toast.success("Class updated successfully!");
        setIsEditingClass(false);
      }
    } catch (error) {
      console.error("Failed to update class:", error);
      toast.error("Failed to update class");
    } finally {
      setSavingClass(false);
    }
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 text-amber-600">
          <Info size={20} />
          <span className="font-bold">Sign Out?</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to sign out from your account?</p>
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
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
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
      const id = userData?._id || localStorage.getItem("userId");
      const token = localStorage.getItem("refreshToken");

      await API.post("/auth/logout", { id, token });
      dispatch(logout());
      navigate("/auth/login");
      toast.success("Logged out successfully", { id: loadingToast });
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      navigate("/auth/login");
      toast.dismiss(loadingToast);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await API.put("/user/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      if (res.data.success) {
        toast.success("Password changed successfully");
        setPasswords({ current: "", new: "", confirm: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateSettings = async (updates) => {
    try {
      const res = await API.put("/user/update-settings", updates);
      if (res.data.success) {
        setStats(prev => ({ ...prev, ...res.data.data }));
        if (updates.theme) {
          dispatch(setTheme(updates.theme));
        }
        // Update persistent userData in Redux/LocalStorage
        dispatch(updateUser(updates));
        toast.success("Preferences updated");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
    setShowPictureMenu(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    setUploadingPicture(true);
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      const response = await API.post("/user/upload-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        setProfilePicture(response.data.data.profilePicture);
        const updatedUser = { ...userData, profilePicture: response.data.data.profilePicture };
        dispatch(login({
          user: updatedUser,
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken")
        }));
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleRemovePicture = async () => {
    setShowPictureMenu(false);
    try {
      const response = await API.delete("/user/remove-profile-picture");
      if (response.data.success) {
        setProfilePicture(null);
        const updatedUser = { ...userData, profilePicture: null };
        dispatch(login({
          user: updatedUser,
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken")
        }));
        toast.success("Profile picture removed");
      }
    } catch (error) {
      toast.error("Failed to remove profile picture");
    }
  };

  const openCamera = async () => {
    setShowPictureMenu(false);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      toast.error("Camera access denied");
      setShowCameraModal(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
        closeCamera();
        await uploadProfilePicture(file);
      }
    }, "image/jpeg", 0.9);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const getProfilePictureUrl = () => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`}`;
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setIsSubmittingTicket(true);
    try {
      const response = await API.post("/support/tickets", {
        ...ticketForm,
        type: 'Ticket',
        tags: {
          class: userData?.class || 'N/A',
          course: userData?.batch || 'N/A'
        }
      });
      if (response.data.success) {
        setLastCreatedTicketId(response.data.data.ticketId);
        toast.success("Support ticket created!");
        setSupportStep('success');
        fetchTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background dark:bg-[#0b162b] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background dark:bg-[#0b162b]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[120px] pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

            {/* Sub Sidebar - Hidden in Analytics view for full-width experience */}
            {activeView !== 'analytics' && (
              <aside className="w-full lg:w-72 shrink-0">
                <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border overflow-hidden sticky top-0 lg:top-6 shadow-sm">
                  <div className="p-6 pb-4 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden mb-4">
                      {profilePicture ? (
                        <img src={getProfilePictureUrl()} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate w-full">{userData?.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-full">{userData?.email}</p>
                  </div>

                  <div className="px-3 pb-6">
                    <div className="h-px bg-border my-2" />
                    <nav className="space-y-1">
                      {[
                        { id: 'account', label: 'Account', icon: User },
                        { id: 'analytics', label: 'Analytics', icon: PieChart },
                        { id: 'settings', label: 'Settings', icon: Settings },
                        { id: 'guide', label: 'Guide', icon: BookOpen },
                        { id: 'help', label: 'Help', icon: HelpCircle },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/profile?view=${item.id}`)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeView === item.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                          <item.icon size={20} />
                          {item.label}
                        </button>
                      ))}
                      <div className="h-px bg-border my-4" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                      >
                        <LogOut size={20} />
                        Sign Out
                      </button>
                    </nav>
                  </div>
                </div>
              </aside>
            )}

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {activeView === 'account' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border shadow-sm">
                    <div className="h-32 bg-gradient-to-r from-primary to-[#123b70] relative rounded-t-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-white/10 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    </div>
                    <div className="px-6 pb-6 -mt-12 relative z-20 flex flex-col md:flex-row items-center md:items-end gap-6">
                      <div className="relative group" ref={pictureMenuRef}>
                        <div
                          className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-xl overflow-hidden cursor-pointer"
                          onClick={() => setShowPictureMenu(!showPictureMenu)}
                        >
                          {uploadingPicture ? (
                            <div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                          ) : profilePicture ? (
                            <img src={getProfilePictureUrl()} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700"><User size={40} /></div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowPictureMenu(!showPictureMenu)}
                          className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                          <Camera size={14} />
                        </button>
                        {showPictureMenu && (
                          <div className="absolute top-full left-0 mt-4 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-border overflow-hidden z-[100]">
                            <button onClick={openCamera} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-sm font-medium transition-colors">
                              <Camera size={18} className="text-blue-500" /> Take Photo
                            </button>
                            <button onClick={handleFileSelect} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-sm font-medium transition-colors">
                              <Upload size={18} className="text-emerald-500" /> Upload Photo
                            </button>
                            {profilePicture && (
                              <button onClick={handleRemovePicture} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium border-t border-border transition-colors">
                                <Trash2 size={18} /> Remove Photo
                              </button>
                            )}
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                          {isEditing ? (
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="text-2xl font-bold bg-transparent border-b-2 border-primary focus:outline-none dark:text-white"
                              autoFocus
                            />
                          ) : (
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData?.name}</h1>
                          )}
                          <button
                            onClick={() => isEditing ? handleSaveName() : setIsEditing(true)}
                            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                          >
                            {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
                          </button>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{userData?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Security Settings */}
                    <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-primary" />
                        Security Settings
                      </h3>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="text-left">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Current Password</label>
                          <input type="password" required value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="w-full px-4 py-3 bg-background dark:bg-slate-800 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white" placeholder="••••••••" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                          <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">New Password</label>
                            <input type="password" required value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                              className="w-full px-4 py-3 bg-background dark:bg-slate-800 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white" placeholder="••••••••" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Confirm New</label>
                            <input type="password" required value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                              className="w-full px-4 py-3 bg-background dark:bg-slate-800 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white" placeholder="••••••••" />
                          </div>
                        </div>
                        <button type="submit" disabled={changingPassword} className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                          {changingPassword ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck size={20} />}
                          Update Password
                        </button>
                      </form>
                    </div>

                    {/* Session Information */}
                    <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Smartphone size={20} className="text-primary" />
                        Session Info
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-background dark:bg-slate-800 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <Clock size={20} className="text-blue-500" />
                            <div className="text-left">
                              <div className="text-sm font-bold dark:text-white">Last Login</div>
                              <div className="text-xs text-gray-500">{stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-background dark:bg-slate-800 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <Laptop size={20} className="text-emerald-500" />
                            <div className="text-left">
                              <div className="text-sm font-bold dark:text-white">Active Sessions</div>
                              <div className="text-xs text-gray-500">{stats.activeSessions} active session{stats.activeSessions !== 1 ? 's' : ''}</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 flex items-start gap-3">
                          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed text-left">
                            Session information helps keep your account secure. If you see unfamiliar activity, change your password immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'analytics' && (
                <AnalyticsView stats={stats} userData={userData} />
              )}

              {activeView === 'settings' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <Settings size={22} className="text-primary" />
                      App Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block text-left">Theme Preference</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'light', label: 'Light', icon: Sun },
                            { id: 'dark', label: 'Dark', icon: Moon },
                            { id: 'system', label: 'System', icon: Laptop },
                          ].map((t) => (
                            <button key={t.id} onClick={() => handleUpdateSettings({ theme: t.id })}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === t.id ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background dark:bg-slate-800 text-gray-500 hover:border-gray-300'}`}>
                              <t.icon size={20} />
                              <span className="text-xs font-bold">{t.label}</span>
                            </button>
                          ))}
                        </div>
                        <div className="pt-4 text-left">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Language</label>
                          <select value={stats.language} onChange={(e) => handleUpdateSettings({ language: e.target.value })}
                            className="w-full px-4 py-3 bg-background dark:bg-slate-800 border border-border rounded-xl dark:text-white font-medium">
                            <option value="English">English</option>
                            <option value="Hindi">Hindi (Beta)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block text-left">Notifications</label>
                        <div className="space-y-3">
                          {[
                            { id: 'email', label: 'Email Notifications', desc: 'Updates about your progress' },
                            { id: 'inApp', label: 'In-App Alerts', desc: 'Real-time learning alerts' },
                          ].map((n) => (
                            <div key={n.id} className="flex items-center justify-between p-4 bg-background dark:bg-slate-800 rounded-xl border border-border">
                              <div className="text-left">
                                <div className="text-sm font-bold dark:text-white">{n.label}</div>
                                <div className="text-xs text-gray-500">{n.desc}</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={stats.notificationPrefs?.[n.id]} onChange={(e) => handleUpdateSettings({ notificationPrefs: { ...stats.notificationPrefs, [n.id]: e.target.checked } })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {activeView === 'guide' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-8 shadow-sm">
                    <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center gap-3">
                      <BookOpen size={28} className="text-primary" />
                      Platform Guide
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { step: 1, title: 'Access Courses', desc: 'Find curated subject-wise notes and videos in the Learning section.', icon: Book },
                        { step: 2, title: 'Attempt Quizzes', desc: 'Earn XP and maintain your streak by taking daily quizzes.', icon: Target },
                        { step: 3, title: 'Track Progress', desc: 'View performance analytics and previous attempts in the Dashboard.', icon: BarChart3 },
                        { step: 4, title: 'Live Classes', desc: 'Join interactive live sessions with teachers according to your schedule.', icon: Video },
                        { step: 5, title: 'Doubt Support', desc: 'Use the Chat feature to ask questions and get help from experts.', icon: MessageSquare },
                        { step: 6, title: 'Resources', desc: 'Download NCERT solutions, Exemplars, and Previous Year Questions.', icon: LayoutGrid },
                      ].map((s) => (
                        <div key={s.step} className="p-6 bg-background dark:bg-slate-800 rounded-2xl border border-border relative text-left transition-all hover:border-primary/50 group">
                          <span className="absolute -top-4 -left-3 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">{s.step}</span>
                          <div className="text-primary mb-4 mt-2 group-hover:scale-110 transition-transform"><s.icon size={28} /></div>
                          <h3 className="text-lg font-bold mb-2 dark:text-white">{s.title}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'help' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card dark:bg-slate-900/50 rounded-2xl border border-border p-8 shadow-sm">
                    <h2 className="text-2xl font-bold dark:text-white mb-8 flex items-center gap-3">
                      <HelpCircle size={28} className="text-primary" />
                      Help Center
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                      {[
                        { q: 'How to reset my password?', a: 'Go to Account > Security and use the password update form.' },
                        { q: 'Is my data secure?', a: 'We use industry-standard encryption for all your personal data.' },
                        { q: 'How to contact teacher?', a: 'Use the Chat section to message your respective subject teachers.' },
                        { q: 'Can I change my class?', a: 'Class changes are restricted but can be requested from the Account view.' },
                        { q: 'How to join live classes?', a: 'Links for live classes appear in your batch dashboard when active.' },
                        { q: 'What are Streaks/XP?', a: 'Consistent daily usage builds streaks and earns XP for ranking.' },
                        { q: 'Accessing paid batches?', a: 'Once enrolled, paid batches will appear in the "My Batches" section.' },
                        { q: 'Where are quiz results?', a: 'Detailed analysis of all attempts is available in your Dashboard.' },
                      ].map((faq, i) => (
                        <div key={i} className="p-4 bg-background dark:bg-slate-800 rounded-xl border border-border hover:border-primary/30 transition-colors">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <MessageSquare size={16} className="text-primary" /> {faq.q}
                          </h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                    {/* Support Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                        <p className="font-bold text-primary mb-4">Facing an issue?</p>
                        <button
                          onClick={() => { setShowSupportModal(true); setSupportStep('choice'); }}
                          className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                        >
                          <Plus size={20} />
                          Contact Support
                        </button>
                      </div>

                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-border">
                        <p className="font-bold text-gray-700 dark:text-gray-300 mb-4">Existing Requests</p>
                        <button
                          onClick={() => navigate("/support-tickets")}
                          className="w-full py-4 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-border rounded-xl font-bold hover:border-primary transition-all flex items-center justify-center gap-2"
                        >
                          <Ticket size={20} className="text-primary" />
                          View All Tickets
                          {myTickets.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                              {myTickets.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Camera Modal */}
        {showCameraModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-card dark:bg-slate-900 rounded-2xl overflow-hidden max-w-lg w-full border border-border shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2"><Camera size={20} className="text-primary" /> Take Photo</h3>
                <button onClick={closeCamera} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
              </div>
              <div className="relative bg-black aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="p-4 flex items-center justify-center gap-4 bg-blue-50/50 dark:bg-slate-800/50">
                <button onClick={closeCamera} className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium">Cancel</button>
                <button onClick={capturePhoto} className="px-8 py-3 bg-primary text-white rounded-xl transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-primary/25">
                  <Camera size={20} /> Capture
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Support Modal */}
        {showSupportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-card dark:bg-slate-900 rounded-3xl overflow-hidden max-w-xl w-full border border-border shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/50 dark:bg-slate-800/50">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-3">
                  <HelpCircle size={24} className="text-primary" />
                  Help & Support
                </h3>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-8">
                {supportStep === 'choice' && (
                  <div className="space-y-6">
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8">How would you like to reach out to us today?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setSupportStep('ticket')}
                        className="p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-transparent hover:border-primary/50 rounded-2xl text-left transition-all group"
                      >
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Ticket size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Create a Ticket</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Most efficient for technical queries & status tracking.</p>
                      </button>

                      <button
                        onClick={() => setSupportStep('email')}
                        className="p-6 bg-purple-50 dark:bg-purple-900/10 border-2 border-transparent hover:border-purple-500/50 rounded-2xl text-left transition-all group"
                      >
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Mail size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Email Support</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Direct communication via our official helpdesk email.</p>
                      </button>
                    </div>
                  </div>
                )}

                {supportStep === 'ticket' && (
                  <form onSubmit={handleCreateTicket} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Issue Subject</label>
                      <input
                        required
                        type="text"
                        placeholder="Briefly describe the issue"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-primary transition-all shadow-sm"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
                        <select
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-primary transition-all shadow-sm"
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                        >
                          <option>General</option>
                          <option>Technical</option>
                          <option>Academic</option>
                          <option>Payment</option>
                          <option>Batch/Class Change</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Class Context</label>
                        <input
                          disabled
                          type="text"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 dark:bg-slate-800/50 text-gray-400 shadow-sm"
                          value={`Class ${userData?.class || '9/10'}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Detailed Description</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Please provide details about your concern..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-primary transition-all shadow-sm resize-none"
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setSupportStep('choice')}
                        className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
                      >
                        Back
                      </button>
                      <button
                        disabled={isSubmittingTicket}
                        type="submit"
                        className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmittingTicket ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        Create Ticket
                      </button>
                    </div>
                  </form>
                )}

                {supportStep === 'email' && (
                  <div className="text-center space-y-6 py-4">
                    <div className="w-20 h-20 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={40} />
                    </div>
                    <h4 className="text-xl font-bold dark:text-white">Email Our Helpdesk</h4>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Send us an email directly at our official support address. We typically respond within 24 hours.
                    </p>
                    <a
                      href={`mailto:support@sarvottaminstitute.com?subject=Support Request - ${userData?.name}&body=Class: ${userData?.class}%0D%0AUser ID: ${userData?._id}%0D%0A%0D%0ADescription:`}
                      className="inline-flex py-3 px-10 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:bg-purple-700 transition-all items-center gap-2"
                    >
                      <Mail size={20} /> Open Mail Client
                    </a>
                    <button
                      onClick={() => setSupportStep('choice')}
                      className="block w-full text-sm text-gray-400 hover:text-primary transition-colors mt-6"
                    >
                      Choose another method
                    </button>
                  </div>
                )}

                {supportStep === 'success' && (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <Zap size={40} />
                    </div>
                    <h4 className="text-2xl font-bold dark:text-white text-emerald-500">Ticket Submitted!</h4>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 py-2 px-4 rounded-xl border border-emerald-100 dark:border-emerald-800 inline-block">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Ticket ID: #{lastCreatedTicketId}</p>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Your support ticket has been created successfully. Our team will review it and get back to you shortly.
                    </p>
                    <button
                      onClick={() => setShowSupportModal(false)}
                      className="py-3 px-10 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition-all"
                    >
                      Got it, thanks!
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
