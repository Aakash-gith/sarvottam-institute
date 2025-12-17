import React, { useState, useEffect } from "react";
import { Users, Shield, Check, X, AlertCircle, Clock, Search, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

// Tab Components
const AdminDirectory = ({ currentUser }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

    const filteredAdmins = admins.filter(a =>
        a.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.userId?.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading directory...</div>;

    return (
        <div className="space-y-6">
            {/* Header / Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 gap-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Shield className="text-purple-600" /> Admin Directory
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
                    <div key={admin._id} className="bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col relative overflow-hidden group">
                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-bold ${admin.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {admin.isActive ? 'Active' : 'Revoked'}
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {admin.userId?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{admin.userId?.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{admin.userId?.email}</p>
                                <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md mt-1 inline-block capitalize border border-blue-100 dark:border-blue-800">
                                    {admin.role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Permissions Summary or Actions */}
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                            {/* Only Master Admin can see actions */}
                            {currentUser?.role === 'master_admin' && admin.role !== 'master_admin' ? (
                                <div className="flex gap-2">
                                    {admin.isActive ? (
                                        <button
                                            onClick={() => handleToggleAccess(admin._id, false, admin.userId?.name)}
                                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors border border-red-100"
                                        >
                                            Revoke Access
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleToggleAccess(admin._id, true, admin.userId?.name)}
                                            className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
                                        >
                                            Grant Access
                                        </button>
                                    )}
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
