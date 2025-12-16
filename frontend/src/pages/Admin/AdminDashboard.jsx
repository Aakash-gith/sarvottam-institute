import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LogOut,
    FileText,
    BookOpen,
    Bell,
    Calendar,
    Users,
    Settings,
    Menu,
    X,
    Activity,
} from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import NotesUpload from "../../components/admin/NotesUpload";
import PYQUpload from "../../components/admin/PYQUpload";
import EventsManager from "../../components/admin/EventsManager";
import NotificationsManager from "../../components/admin/NotificationsManager";
import AdminRequests from "../../components/admin/AdminRequests";
import AdminUserAnalytics from "../../components/admin/AdminUserAnalytics";

function AdminDashboard() {
    // ... existing state ...
    const [adminInfo, setAdminInfo] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ... existing useEffect ...

    // ... existing fetchAdminInfo ...

    // ... existing handleLogout ...

    // ... existing loading check ...

    const menuItems = [
        {
            id: "overview",
            label: "Overview",
            icon: Settings,
            visible: true,
        },
        {
            id: "analytics",
            label: "User Analytics",
            icon: Activity,
            visible: true,
        },
        {
            id: "notes",
            label: "Upload Notes",
            icon: BookOpen,
            visible: adminInfo?.permissions?.uploadNotes,
        },
        {
            id: "pyq",
            label: "Upload PYQ",
            icon: FileText,
            visible: adminInfo?.permissions?.uploadPYQ,
        },
        {
            id: "events",
            label: "Manage Events",
            icon: Calendar,
            visible: adminInfo?.permissions?.manageEvents,
        },
        {
            id: "notifications",
            label: "Send Notifications",
            icon: Bell,
            visible: adminInfo?.permissions?.sendNotifications,
        },
        {
            id: "admin-requests",
            label: "Admin Requests",
            icon: Users,
            visible: adminInfo?.role === "master_admin",
        },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } bg-gradient-to-b from-blue-800 to-blue-600 text-white transition-all duration-300 flex flex-col`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-blue-700">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🎓</div>
                        {sidebarOpen && <span className="font-bold text-lg">Sarvottam</span>}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {menuItems
                        .filter((item) => item.visible)
                        .map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${activeTab === item.id
                                        ? "bg-blue-700 border-l-4 border-white"
                                        : "hover:bg-blue-700/50"
                                        }`}
                                    title={item.label}
                                >
                                    <Icon size={24} />
                                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                                </button>
                            );
                        })}
                </nav>

                {/* Logout and Toggle */}
                <div className="border-t border-blue-700 p-4 space-y-2">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center p-3 hover:bg-blue-700/50 rounded-lg transition-colors"
                        title="Toggle Sidebar"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                        title="Logout"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {menuItems.find((item) => item.id === activeTab)?.label || "Admin Dashboard"}
                        </h1>
                        {adminInfo && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {adminInfo.userId?.name || "Admin"}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {adminInfo.role.replace("_", " ")}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {adminInfo.userId?.name?.charAt(0).toUpperCase() || "A"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {activeTab === "overview" && <OverviewTab adminInfo={adminInfo} />}
                    {activeTab === "analytics" && <AdminUserAnalytics />}
                    {activeTab === "notes" && <NotesUpload />}
                    {activeTab === "pyq" && <PYQUpload />}
                    {activeTab === "events" && <EventsManager />}
                    {activeTab === "notifications" && <NotificationsManager />}
                    {activeTab === "admin-requests" && adminInfo?.role === "master_admin" && (
                        <AdminRequests />
                    )}
                </div>
            </div>
        </div>
    );
}

function OverviewTab({ adminInfo }) {
    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-2">Welcome, {adminInfo?.userId?.name}! 👋</h2>
                <p className="text-blue-100">
                    Manage all aspects of Sarvottam Institute from this admin panel.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon="📚"
                    title="Upload Notes"
                    description="Share study materials"
                />
                <StatCard
                    icon="📄"
                    title="Upload PYQ"
                    description="Add previous year questions"
                />
                <StatCard
                    icon="📅"
                    title="Manage Events"
                    description="Create and edit events"
                />
                <StatCard
                    icon="🔔"
                    title="Send Notifications"
                    description="Notify all users"
                />
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    );
}

function StatCard({ icon, title, description }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );
}

function PermissionItem({ name, allowed }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">{name}</span>
            {allowed ? (
                <span className="text-green-600 font-bold">✓</span>
            ) : (
                <span className="text-red-600 font-bold">✗</span>
            )}
        </div>
    );
}

export default AdminDashboard;
