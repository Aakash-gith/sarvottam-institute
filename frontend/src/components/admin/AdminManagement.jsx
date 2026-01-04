import React, { useState, useEffect } from "react";
import { Users, Shield, Check, X, AlertCircle, Clock, Search, ChevronRight, Lock, Unlock, Key, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

// Tab Components
const AdminDirectory = ({ currentUser }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Action States
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ open: false, type: null, admin: null });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { data } = await API.get("/admin/list");
            if (data.success) {
                setAdmins(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admins:", error);
            toast.error("Could not load admin directory");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAccess = async (adminId, isActive, name) => {
        if (!window.confirm(`Are you sure you want to ${isActive ? 'Grant' : 'Revoke'} access for ${name}?`)) return;
        try {
            const { data } = await API.put(`/admin/${adminId}/access`, { isActive });
            if (data.success) {
                toast.success(data.message);
                fetchAdmins();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const handleLockToggle = async () => {
        if (!confirmModal.admin) return;
        try {
            setActionLoading(true);
            const user = confirmModal.admin.userId;
            const newLockedStatus = !user.isLocked;
            const response = await API.put(`/admin/users/${user._id}/lock`, {
                locked: newLockedStatus,
                reason: "Administrative Action (Master Admin)"
            });
            if (response.data.success) {
                toast.success(`Admin User ${newLockedStatus ? 'Locked' : 'Unlocked'} Successfully`);
                // Optimistic Update
                setAdmins(prev => prev.map(a => a._id === confirmModal.admin._id ? { ...a, userId: { ...a.userId, isLocked: newLockedStatus } } : a));
            }
        } catch (error) {
            console.error("Lock error", error);
            toast.error("Failed to update lock status");
        } finally {
            setActionLoading(false);
            setConfirmModal({ open: false, type: null, admin: null });
        }
    };

    const handlePasswordReset = async () => {
        if (!confirmModal.admin) return;
        try {
            setActionLoading(true);
            const user = confirmModal.admin.userId;
            const response = await API.put(`/admin/users/${user._id}/reset-password`, {
                type: 'temp'
            });
            if (response.data.success) {
                toast.success("Temporary password sent to admin's email");
            }
        } catch (error) {
            console.error("Reset error", error);
            toast.error("Failed to reset password");
        } finally {
            setActionLoading(false);
            setConfirmModal({ open: false, type: null, admin: null });
        }
    };

    const filteredAdmins = admins.filter(a =>
        a.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.userId?.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading directory...</div>;

    return (
        <div className="space-y-6">
            {/* Header / Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-4 rounded-xl border border-border gap-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Shield className="text-primary" /> Admin Directory
                </h3>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdmins.map((admin) => (
                    <div key={admin._id} className={`bg-card rounded-xl shadow-sm border p-6 flex flex-col relative overflow-hidden group ${admin.userId?.isLocked ? 'border-red-400 bg-red-50/10' : 'border-border'}`}>
                        {/* Status Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                            {admin.userId?.isLocked && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white flex items-center gap-1">
                                    <Lock size={10} /> LOCKED
                                </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${admin.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {admin.isActive ? 'Active' : 'Revoked'}
                            </span>
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {admin.userId?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">{admin.userId?.name}</h4>
                                <p className="text-xs text-muted-foreground">{admin.userId?.email}</p>
                                <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-md mt-1 inline-block capitalize border border-border">
                                    {admin.role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                            {currentUser?.role === 'master_admin' && admin.role !== 'master_admin' ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        {/* Lock/Unlock */}
                                        <button
                                            onClick={() => setConfirmModal({ open: true, type: 'lock', admin })}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-1 ${admin.userId?.isLocked ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                                        >
                                            {admin.userId?.isLocked ? <><Unlock size={12} /> Unlock</> : <><Lock size={12} /> Lock</>}
                                        </button>

                                        {/* Reset Password */}
                                        <button
                                            onClick={() => setConfirmModal({ open: true, type: 'reset', admin })}
                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                                            title="Reset Password"
                                        >
                                            <Key size={16} />
                                        </button>
                                    </div>

                                    {/* Legacy Revoke/Grant */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleAccess(admin._id, !admin.isActive, admin.userId?.name)}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${admin.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                                        >
                                            {admin.isActive ? 'Revoke Access' : 'Grant Access'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-center text-slate-400 italic">
                                    {admin.role === 'master_admin' ? "Master Authority" : "Read Only View"}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate__animated animate__zoomIn animate__faster">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-full ${confirmModal.type === 'lock' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                {confirmModal.type === 'lock' && (confirmModal.admin.userId.isLocked ? <Unlock size={24} /> : <Lock size={24} />)}
                                {confirmModal.type === 'reset' && <Key size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {confirmModal.type === 'lock'
                                        ? (confirmModal.admin.userId.isLocked ? "Unlock Access?" : "Lock Access?")
                                        : "Reset Password?"
                                    }
                                </h3>
                                <p className="text-sm text-slate-500">For Admin: <b>{confirmModal.admin.userId?.name}</b></p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            {confirmModal.type === 'lock'
                                ? `Are you sure you want to ${confirmModal.admin.userId.isLocked ? 'unlock' : 'lock'} this admin account? This will block login access.`
                                : "Generate a temporary password for this admin?"
                            }
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ open: false, type: null, admin: null })}
                                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmModal.type === 'lock' ? handleLockToggle : handlePasswordReset}
                                disabled={actionLoading}
                                className={`flex-1 py-2 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2 ${confirmModal.type === 'lock' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                            >
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PendingRequestsSection = () => {
    // Reusing logic from old AdminRequests, but simplified style
    const [requests, setRequests] = useState([]);

    useEffect(() => { fetchPending(); }, []);

    const fetchPending = async () => {
        try {
            const { data } = await API.get("/admin/pending-requests");
            setRequests(data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAction = async (id, action, reason = "") => {
        try {
            const endpoint = action === 'approve' ? `/admin/approve/${id}` : `/admin/reject/${id}`;
            await API.put(endpoint, { rejectionReason: reason });
            toast.success(`Request ${action}d`);
            fetchPending();
        } catch (e) {
            toast.error("Action failed");
        }
    };

    if (requests.length === 0) return (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500">No pending requests at the moment.</p>
        </div>
    );

    return (
        <div className="grid gap-4">
            {requests.map(req => (
                <div key={req._id} className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{req.fullName}</h4>
                        <p className="text-sm text-slate-500">{req.email}</p>
                        <div className="mt-2 text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 px-3 py-2 rounded-lg inline-block max-w-md">
                            "{req.reason}"
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleAction(req._id, 'approve')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
                            <Check size={16} /> Approve
                        </button>
                        <button onClick={() => handleAction(req._id, 'reject', 'Admin decision')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                            <X size={16} /> Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const RequestRightsSection = ({ currentUser }) => {
    // For normal admins to request permissions
    // Simplification: Just a static message for now as backend endpoint might need work
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl border border-blue-100 dark:border-slate-700 text-center">
            <Shield size={48} className="mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Need more privileges?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-lg mx-auto">
                If you need access to specific features like Notes Upload or Event Management, please contact the Master Admin directly.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
                Contact Master Admin
            </button>
        </div>
    );
};

export default function AdminManagement({ adminInfo }) {
    const [subTab, setSubTab] = useState("directory"); // directory, requests, rights

    return (
        <div className="space-y-8 animate__animated animate__fadeIn">
            {/* Header Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-1 overflow-x-auto">
                <button
                    onClick={() => setSubTab("directory")}
                    className={`pb-3 px-4 text-sm font-semibold transition-colors whitespace-nowrap ${subTab === "directory" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
                >
                    Admins Directory
                </button>
                {adminInfo?.role === 'master_admin' && (
                    <button
                        onClick={() => setSubTab("requests")}
                        className={`pb-3 px-4 text-sm font-semibold transition-colors whitespace-nowrap ${subTab === "requests" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
                    >
                        Pending Requests
                    </button>
                )}
                {adminInfo?.role !== 'master_admin' && (
                    <button
                        onClick={() => setSubTab("rights")}
                        className={`pb-3 px-4 text-sm font-semibold transition-colors whitespace-nowrap ${subTab === "rights" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
                    >
                        Request Rights
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {subTab === "directory" && <AdminDirectory currentUser={adminInfo} />}
                {subTab === "requests" && <PendingRequestsSection />}
                {subTab === "rights" && <RequestRightsSection currentUser={adminInfo} />}
            </div>
        </div>
    );
}
