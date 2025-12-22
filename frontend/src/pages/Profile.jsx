import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../components/Sidebar";
import {
  User, Edit2, Save, X, Trophy, Flame, Brain, Target,
  Calendar, TrendingUp, Award, BookOpen, Mail, GraduationCap,
  CheckCircle, XCircle, Clock, BarChart3, Camera, Upload, Trash2,
  ChevronUp, ChevronDown, Moon, Sun, ChevronRight, Bell, Shield, Settings
} from "lucide-react";
import API from "../api/axios";
import { login } from "../store/authSlice";
import { toggleTheme } from "../store/themeSlice";
import { toast } from "react-hot-toast";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeView = searchParams.get("view") || "settings";
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
  const [uploadingPicture, setUploadingPicture] = useState(false);

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
    recentQuizzes: [],
    quizzesByMonth: [],
    favoriteTopics: []
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
  }, [userData, navigate]);

  const fetchProfileStats = async () => {
    try {
      const response = await API.get("/user/profile-stats");
      if (response.data.success) {
        setStats(response.data.data);
        setEditName(response.data.data.name || userData?.name || "");
        setProfilePicture(response.data.data.profilePicture || null);
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
        // Update Redux and localStorage
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
        // Update Redux and localStorage
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

  // Profile picture handlers
  const handleFileSelect = () => {
    fileInputRef.current?.click();
    setShowPictureMenu(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB)
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
        // Update Redux
        const updatedUser = { ...userData, profilePicture: response.data.data.profilePicture };
        dispatch(login({
          user: updatedUser,
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken")
        }));
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
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
        // Update Redux
        const updatedUser = { ...userData, profilePicture: null };
        dispatch(login({
          user: updatedUser,
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken")
        }));
        toast.success("Profile picture removed");
      }
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      toast.error("Failed to remove profile picture");
    }
  };

  // Camera handlers
  const openCamera = async () => {
    setShowPictureMenu(false);
    setShowCameraModal(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Unable to access camera. Please check permissions.");
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

    // Convert to blob
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

  const getGradeFromScore = (score) => {
    if (score >= 90) return { letter: "A+", color: "text-green-400" };
    if (score >= 80) return { letter: "A", color: "text-green-500" };
    if (score >= 70) return { letter: "B", color: "text-blue-400" };
    if (score >= 60) return { letter: "C", color: "text-yellow-400" };
    if (score >= 50) return { letter: "D", color: "text-orange-400" };
    return { letter: "F", color: "text-red-400" };
  };

  const accuracyRate = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 0;

  const getProfilePictureUrl = () => {
    if (!profilePicture) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${baseUrl}${profilePicture}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center ml-0 md:ml-[120px] pt-16 md:pt-0">
          <div className="text-gray-600 text-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-[120px] pt-16 md:pt-0">


        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header - Clean Modern Design */}
            {activeView === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-visible">
                {/* Gradient Banner */}
                {/* Professional Deep Teal Banner */}
                <div className="h-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f1f3c] to-slate-900 relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="px-8 pb-8 -mt-20 relative">
                  <div className="flex flex-col items-center md:items-end gap-6 md:flex-row">

                    {/* Circular Avatar */}
                    <div className="relative group" ref={pictureMenuRef}>
                      <div
                        className="w-40 h-40 rounded-full border-4 border-white bg-slate-100 shadow-2xl overflow-hidden cursor-pointer relative z-10"
                        onClick={() => setShowPictureMenu(!showPictureMenu)}
                      >
                        {uploadingPicture ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : profilePicture ? (
                          <img
                            src={getProfilePictureUrl()}
                            alt="Profile"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                            <User size={64} />
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={32} className="text-white drop-shadow-md" />
                        </div>
                      </div>

                      {/* Edit Badge (Bottom Right of Circle) */}
                      <button
                        className="absolute bottom-2 right-2 z-20 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setShowPictureMenu(!showPictureMenu); }}
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Picture Menu Dropdown */}
                      {showPictureMenu && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                            Profile Photo
                          </div>
                          <button
                            onClick={openCamera}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            <Camera size={18} className="text-blue-500" />
                            <span>Take Photo</span>
                          </button>
                          <button
                            onClick={handleFileSelect}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            <Upload size={18} className="text-emerald-500" />
                            <span>Upload Photo</span>
                          </button>
                          {profilePicture && (
                            <button
                              onClick={handleRemovePicture}
                              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium border-t border-gray-50"
                            >
                              <Trash2 size={18} />
                              <span>Remove Photo</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Hidden input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* User Info & Details */}
                    <div className="flex-1 text-center md:text-left pt-12 md:pt-0 pb-2">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                        {/* Name & Basic Info Group */}
                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="text-3xl font-bold text-gray-900 bg-white border-b-2 border-blue-500 focus:outline-none px-1"
                                autoFocus
                              />
                              <button onClick={handleSaveName} disabled={saving} className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                                {saving ? <div className="w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin" /> : <Save size={20} />}
                              </button>
                              <button onClick={handleCancelEdit} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                              </button>
                            </div>
                          ) : (
                            <div className="group flex items-center justify-center md:justify-start gap-3 mb-1">
                              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{userData?.name}</h1>
                              <button
                                onClick={() => setIsEditing(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 size={18} />
                              </button>
                            </div>
                          )}

                          {/* Academic Details Row */}
                          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              <Mail size={16} className="text-gray-600" />
                              <span className="text-sm text-gray-700 font-medium">{userData?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap size={16} className="text-blue-600" />
                              {isEditingClass ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-gray-100 rounded-lg border border-blue-300">
                                    <select
                                      value={editClass}
                                      onChange={(e) => setEditClass(Number(e.target.value))}
                                      className="p-1.5 bg-transparent text-gray-900 font-semibold text-center focus:outline-none cursor-pointer"
                                    >
                                      <option value={9}>Class IX (9th)</option>
                                      <option value={10}>Class X (10th)</option>
                                    </select>
                                  </div>
                                  <button
                                    onClick={handleSaveClass}
                                    disabled={savingClass}
                                    className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                                  >
                                    {savingClass ? (
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                      <Save size={16} className="text-white" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditClass(userData?.class || 9);
                                      setIsEditingClass(false);
                                    }}
                                    className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                  >
                                    <X size={16} className="text-gray-600" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                  <span className="text-sm font-medium text-gray-700">Class {userData?.class === 9 ? "IX" : "X"}</span>
                                  <button
                                    onClick={() => setIsEditingClass(true)}
                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Change class"
                                  >
                                    <Edit2 size={14} className="text-gray-500 hover:text-gray-700" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Stats Badges */}
                          <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-full border border-orange-200 shadow-sm">
                              <Flame size={18} className="text-orange-500" />
                              <span className="text-orange-700 font-semibold text-sm">{stats.currentStreak} Day Streak</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                              <Brain size={18} className="text-blue-500" />
                              <span className="text-blue-700 font-semibold text-sm">{stats.totalQuizzes} Quizzes</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                              <Trophy size={18} className="text-green-500" />
                              <span className="text-green-700 font-semibold text-sm">Best: {stats.bestScore}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* App Preferences Section */}
            {activeView === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Appearance Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-gray-400" />
                    App Preferences
                  </h3>
                  <div className="space-y-3">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'} transition-colors`}>
                          {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Appearance</div>
                          <div className="text-sm text-gray-500 font-medium">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => dispatch(toggleTheme())}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-spring ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-spring ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Settings Placeholder */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 opacity-60 pointer-events-none grayscale">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-gray-400" />
                    Security & Privacy
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-500 text-center text-sm font-medium">
                    More settings coming soon...
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {activeView === 'analytics' && (
              <>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Total Quizzes */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Brain size={24} className="text-white" />
                      </div>
                      <span className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Total Quizzes Taken</p>
                  </div>

                  {/* Best Score */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Trophy size={24} className="text-white" />
                      </div>
                      <span className="text-3xl font-bold text-gray-900">{stats.bestScore}%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Best Quiz Score</p>
                  </div>

                  {/* Average Score */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                        <BarChart3 size={24} className="text-white" />
                      </div>
                      <span className="text-3xl font-bold text-gray-900">{stats.averageScore}%</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Average Score</p>
                  </div>

                  {/* Best Streak */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Flame size={24} className="text-white" />
                      </div>
                      <span className="text-3xl font-bold text-gray-900">{stats.bestStreak}</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Best Login Streak</p>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Accuracy Stats */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                      <Target size={20} className="text-purple-500" />
                      Accuracy Overview
                    </h3>

                    {/* Accuracy Ring */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            strokeDasharray={`${(accuracyRate / 100) * 251} 251`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8B5CF6" />
                              <stop offset="100%" stopColor="#6366F1" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">{accuracyRate}%</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500" />
                            <span className="text-gray-700 font-medium">Correct</span>
                          </div>
                          <span className="text-green-600 font-bold text-lg">{stats.totalCorrect}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <XCircle size={18} className="text-red-500" />
                            <span className="text-gray-700 font-medium">Incorrect</span>
                          </div>
                          <span className="text-red-600 font-bold text-lg">{stats.totalIncorrect}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-500" />
                            <span className="text-gray-700 font-medium">Total</span>
                          </div>
                          <span className="text-blue-600 font-bold text-lg">{stats.totalQuestions}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Favorite Topics */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                      <Award size={20} className="text-yellow-400" />
                      Top Quiz Topics
                    </h3>

                    {stats.favoriteTopics && stats.favoriteTopics.length > 0 ? (
                      <div className="space-y-3">
                        {stats.favoriteTopics.slice(0, 5).map((topic, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' :
                                index === 1 ? 'bg-gray-400 text-black' :
                                  index === 2 ? 'bg-orange-600 text-white' :
                                    'bg-gray-500 text-white'
                                }`}>
                                {index + 1}
                              </span>
                              <span className="text-gray-800 font-medium truncate max-w-[150px]">{topic.topic}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-blue-600 font-semibold">{topic.count} quiz{topic.count > 1 ? 'zes' : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Brain size={40} className="mx-auto mb-3 opacity-50" />
                        <p>Take quizzes to see your favorite topics!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Quizzes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock size={20} className="text-blue-500" />
                      Recent Quiz Activity
                    </h3>
                    {stats.recentQuizzes && stats.recentQuizzes.length > 0 && (
                      <button
                        onClick={() => navigate("/quiz/history")}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All →
                      </button>
                    )}
                  </div>

                  {stats.recentQuizzes && stats.recentQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stats.recentQuizzes.slice(0, 6).map((quiz, index) => {
                        const grade = getGradeFromScore(quiz.score);
                        return (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100 hover:border-gray-200"
                            onClick={() => navigate(`/quiz/results/${quiz._id}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-gray-800 font-medium truncate flex-1 mr-2">{quiz.topic}</h4>
                              <span className={`text-lg font-bold ${grade.color}`}>{grade.letter}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">
                                {quiz.correctAnswers}/{quiz.totalQuestions} correct
                              </span>
                              <span className="text-blue-600 font-semibold">{quiz.score}%</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">
                              {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Brain size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2 text-gray-600">No quizzes taken yet</p>
                      <p className="text-sm mb-4 text-gray-500">Start your learning journey by taking a quiz!</p>
                      <button
                        onClick={() => navigate("/quiz/create")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors shadow-sm"
                      >
                        Take Your First Quiz
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Camera Modal */}
        {
          showCameraModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full border border-gray-200 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Camera size={20} className="text-blue-500" />
                    Take Photo
                  </h3>
                  <button
                    onClick={closeCamera}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="p-4 flex items-center justify-center gap-4 bg-gray-50">
                  <button
                    onClick={closeCamera}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2 font-semibold shadow-sm"
                  >
                    <Camera size={20} />
                    Capture
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div >
  );
}

export default Profile;
