import React, { useState, useEffect, useCallback } from "react";
import {
    Search, Filter, Ticket, Mail, Clock, CheckCircle2,
    AlertCircle, User, MessageSquare, Send,
    History, ChevronRight, Loader2,
    Check, X, Shield, Lock, FileText, ExternalLink, Plus
} from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const AdminSupport = ({ adminInfo }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDetails, setTicketDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    // Action States
    const [replyText, setReplyText] = useState("");
    const [internalNote, setInternalNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [admins, setAdmins] = useState([]);

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.get("/support/admin/all", {
                params: {
                    status: statusFilter === "all" ? undefined : statusFilter,
                    type: typeFilter === "all" ? undefined : typeFilter
                }
            });
            if (response.data.success) {
                setTickets(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
            toast.error("Could not load support tickets");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    const fetchAdmins = async () => {
        try {
            const { data } = await API.get("/admin/list");
            if (data.success) {
                setAdmins(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchAdmins();
    }, [fetchTickets]);

    const fetchTicketDetails = async (id) => {
        try {
            setLoadingDetails(true);
            const response = await API.get(`/support/tickets/${id}`);
            if (response.data.success) {
                setTicketDetails(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to load ticket details");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        fetchTicketDetails(ticket._id);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await API.put(`/support/admin/tickets/${id}/status`, { status: newStatus });
            if (response.data.success) {
                toast.success(`Status updated to ${newStatus}`);
                setTicketDetails(prev => ({ ...prev, status: newStatus }));
                setTickets(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAssign = async (adminId) => {
        try {
            const response = await API.put(`/support/admin/tickets/${selectedTicket._id}/assign`, { adminId });
            if (response.data.success) {
                toast.success("Ticket assigned successfully");
                fetchTicketDetails(selectedTicket._id);
            }
        } catch (error) {
            toast.error("Failed to assign ticket");
        }
    };

    const handleAddMessage = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await API.post(`/support/tickets/${selectedTicket._id}/message`, {
                text: replyText
            });
            if (response.data.success) {
                toast.success("Reply sent");
                setReplyText("");
                fetchTicketDetails(selectedTicket._id);
            }
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddInternalNote = async () => {
        if (!internalNote.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await API.post(`/support/admin/tickets/${selectedTicket._id}/internal-note`, {
                text: internalNote
            });
            if (response.data.success) {
                toast.success("Note added");
                setInternalNote("");
                fetchTicketDetails(selectedTicket._id);
            }
        } catch (error) {
            toast.error("Failed to add note");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTickets = (tickets || []).filter(t => {
        const searchLower = search.toLowerCase();
        const subjectMatch = t.subject?.toLowerCase()?.includes(searchLower) || false;
        const nameMatch = t.user?.name?.toLowerCase()?.includes(searchLower) || false;
        const emailMatch = t.user?.email?.toLowerCase()?.includes(searchLower) || false;
        const idMatch = t.ticketId?.toLowerCase()?.includes(searchLower) || false;

        return subjectMatch || nameMatch || emailMatch || idMatch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Open": return "bg-red-100 text-red-700 border-red-200";
            case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="flex h-[calc(100vh-180px)] overflow-hidden bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 animate__animated animate__fadeIn">
            {/* Left Sidebar: Ticket List */}
            <div className="w-[380px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {/* Header & Search */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Ticket className="text-purple-600" size={20} />
                            Support Inbox
                        </h2>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                            {tickets.length} Total
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by subject, user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs p-1.5 focus:outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs p-1.5 focus:outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="Ticket">Ticket</option>
                            <option value="Email">Email</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
                            <Loader2 className="animate-spin" />
                            <p className="text-xs">Loading items...</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                <Ticket size={24} />
                            </div>
                            <p className="text-sm font-medium">No support requests found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {filteredTickets.map((ticket) => (
                                <button
                                    key={ticket._id}
                                    onClick={() => handleSelectTicket(ticket)}
                                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group ${selectedTicket?._id === ticket._id ? 'bg-purple-50/50 dark:bg-purple-900/10 border-l-2 border-purple-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            {ticket.type === "Email" ? <Mail size={14} className="text-blue-500" /> : <Ticket size={14} className="text-purple-500" />}
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">#{ticket.ticketId}</span>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusStyle(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-1">{ticket.subject}</h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 truncate max-w-[180px]">{ticket.user?.name || "Unknown User"}</p>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane: Ticket Details */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                {selectedTicket ? (
                    loadingDetails ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-purple-600" />
                        </div>
                    ) : ticketDetails ? (
                        <>
                            {/* Detail Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{ticketDetails?.subject}</h2>
                                            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getStatusStyle(ticketDetails?.status)}`}>
                                                {ticketDetails?.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            Category: <span className="text-slate-700 dark:text-slate-300 font-medium">{ticketDetails?.category}</span>
                                            •
                                            Type: <span className="text-slate-700 dark:text-slate-300 font-medium">{ticketDetails?.type}</span>
                                            •
                                            Class: <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                {Array.isArray(ticketDetails?.tags)
                                                    ? ticketDetails.tags.join(", ")
                                                    : (ticketDetails?.tags?.class ? `${ticketDetails.tags.class}th` : (ticketDetails?.tags?.course || "N/A"))}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 relative">
                                        <select
                                            className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
                                            onChange={(e) => handleUpdateStatus(ticketDetails?._id, e.target.value)}
                                            value={ticketDetails?.status || "Open"}
                                        >
                                            <option value="Open" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Set Open</option>
                                            <option value="In Progress" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Set In Progress</option>
                                            <option value="Resolved" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Set Resolved</option>
                                        </select>
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={14} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center text-sm bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                                            {ticketDetails?.user?.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white leading-none">{ticketDetails?.user?.name}</p>
                                            <p className="text-[10px] text-slate-500">{ticketDetails?.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-2"></div>
                                    <div className="flex-1 min-w-[150px]">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Assigned To</p>
                                        <div className="relative">
                                            <select
                                                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100 cursor-pointer appearance-none transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                                                value={ticketDetails?.assignedTo?._id || ""}
                                                onChange={(e) => handleAssign(e.target.value)}
                                            >
                                                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Unassigned</option>
                                                {admins.map(admin => (
                                                    <option
                                                        key={admin._id}
                                                        value={admin._id}
                                                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    >
                                                        {admin.userId?.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <ChevronRight size={14} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages & Timeline */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
                                {/* Initial Description */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                                        <FileText size={16} />
                                        <span className="text-xs font-bold uppercase">Initial Request</span>
                                        <span className="text-[10px] ml-auto">{ticketDetails?.createdAt ? new Date(ticketDetails.createdAt).toLocaleString() : ""}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 text-sm whitespace-pre-wrap">{ticketDetails?.description}</p>
                                </div>

                                {/* Conversation */}
                                {ticketDetails.messages?.map((msg, idx) => {
                                    const isSenderAdmin = msg.senderModel === 'AdminUser';
                                    const senderName = isSenderAdmin
                                        ? (msg.sender?.userId?.name || msg.sender?.name || 'Admin')
                                        : (msg.sender?.name || ticketDetails.user?.name || 'User');

                                    return (
                                        <div key={idx} className={`flex ${isSenderAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm border ${isSenderAdmin
                                                ? 'bg-purple-600 text-white border-purple-500 rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold opacity-70">
                                                        {senderName}
                                                    </span>
                                                    <span className="text-[9px] opacity-50 ml-auto">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Internal Notes Section */}
                                {ticketDetails.internalNotes?.length > 0 && (
                                    <div className="space-y-3 mt-8">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Lock size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Internal Notes (Admin Only)</span>
                                        </div>
                                        {ticketDetails.internalNotes.map((note, idx) => (
                                            <div key={idx} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                                                <div className="flex justify-between mb-1 opacity-70">
                                                    <span className="font-bold">{note.admin?.userId?.name || note.admin?.name || "Admin"}</span>
                                                    <span>{new Date(note.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p>{note.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reply Box */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="space-y-4">
                                    {/* Action Tabs */}
                                    <div className="flex gap-4 mb-2">
                                        <button className="text-xs font-bold text-purple-600 border-b-2 border-purple-600 pb-1 flex items-center gap-1.5">
                                            <Send size={14} /> Send Reply
                                        </button>
                                        <div className="relative group">
                                            <button
                                                onClick={() => { }}
                                                className="text-xs font-bold text-slate-400 hover:text-amber-500 pb-1 flex items-center gap-1.5 transition-colors"
                                            >
                                                <Lock size={14} /> Add Internal Note
                                            </button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleAddMessage} className="space-y-3">
                                        <textarea
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none"
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Internal note..."
                                                    value={internalNote}
                                                    onChange={(e) => setInternalNote(e.target.value)}
                                                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white w-48 focus:ring-1 focus:ring-amber-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddInternalNote}
                                                    disabled={!internalNote.trim() || isSubmitting}
                                                    className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!replyText.trim() || isSubmitting}
                                                className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                                            >
                                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Reply</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                            <AlertCircle size={40} className="mb-4 opacity-20" />
                            <h3 className="text-lg font-bold mb-2">Error Loading Details</h3>
                            <p className="text-sm">We couldn't load the full details for this ticket. Please try refreshing or select another ticket.</p>
                            <button onClick={() => fetchTicketDetails(selectedTicket._id)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold">Retry</button>
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Mail size={40} className="text-slate-200 dark:text-slate-700" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Select a request to view</h3>
                        <p className="text-sm max-w-xs">Choose a support ticket or email from the left sidebar to see the full conversation and manage its status.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSupport;
