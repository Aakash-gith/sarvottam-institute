import React, { useState, useEffect } from "react";
import { LogOut, User, Bell, Clock, Flame } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import defaultUser from "../assets/default-user.png";

function HeaderBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [showNotifications, setShowNotifications] = useState(false);
  const profilePicture = userData?.profilePicture;
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getProfilePictureUrl = () => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${baseUrl}${profilePicture}`;
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm rounded-xl">
      {/* Left Section - Time */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
          <Clock size={16} className="text-blue-600" />
          <div className="text-gray-700 text-sm font-medium">{currentTime}</div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
          <Flame size={18} className="text-orange-500" />
          <span className="text-sm font-medium text-orange-700">{userData?.streak || 0} day streak</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">3</span>
        </button>

        {/* Profile Picture & Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-gray-800 text-sm font-medium">{userData?.name?.split(" ")[0]}</p>
            <p className="text-gray-500 text-xs">Class {userData?.class === 9 ? "IX" : "X"}</p>
          </div>
          <img
            src={getProfilePictureUrl() || defaultUser}
            alt="Profile"
            className="w-9 h-9 rounded-full border-2 border-blue-500 cursor-pointer object-cover hover:border-blue-400 transition shadow-sm"
            onClick={() => navigate("/profile")}
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all font-medium text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default HeaderBar;
