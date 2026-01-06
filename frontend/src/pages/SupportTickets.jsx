import React, { useState, useEffect } from "react";
import {
    Ticket, Search, Filter, ChevronRight,
    ArrowLeft, Clock, CheckCircle2, AlertCircle,
    MessageSquare, Loader2, Calendar, LayoutGrid,
    Send, User, ShieldCheck, FileText, Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

const SupportTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Detail View States
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [ticketDetails, setTicketDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await API.get("/support/my-tickets");
            if (response.data.success) {
                setTickets(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

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

    const handleSelectTicket = (id) => {
        setSelectedTicketId(id);
        fetchTicketDetails(id);
    };

    const handleBackToList = () => {
        setSelectedTicketId(null);
        setTicketDetails(null);
        fetchTickets(); // Refresh list to catch status updates
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setIsSubmittingReply(true);
            const response = await API.post(`/support/tickets/${selectedTicketId}/message`, {
                text: replyText
            });
            if (response.data.success) {
                toast.success("Reply sent successfully");
                setReplyText("");
                fetchTicketDetails(selectedTicketId);
            }
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Open": return "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30";
            case "In Progress": return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30";
            case "Resolved": return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30";
            default: return "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700";
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || (t.ticketId && t.ticketId.toLowerCase().includes(search.toLowerCase()));
        const matchesFilter = filter === "all" || t.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex min-h-screen bg-background dark:bg-[#0b162b]">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-0 md:ml-[120px]">
                <main className="flex-1 p-4 md:p-8 lg:p-12">
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {!selectedTicketId ? (
                            <>
                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card dark:bg-slate-900/50 p-6 rounded-3xl border border-border shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => navigate("/profile")}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                                        >
                                            <ArrowLeft size={24} className="text-slate-500 group-hover:text-primary" />
                                        </button>
                                        <div>
                                            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                                                <Ticket className="text-primary" size={28} />
                                                My Support Tickets
                                            </h1>
                                            <p className="text-sm text-slate-500">Track and manage your help requests</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                                        <Clock size={18} className="text-primary" />
                                        <span className="text-sm font-bold text-primary">{tickets.filter(t => t.status !== 'Resolved').length} Active Tickets</span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by Ticket ID or Subject..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-card dark:bg-slate-900/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {['all', 'Open', 'In Progress', 'Resolved'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setFilter(f)}
                                                className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${filter === f
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                                                        : 'bg-card dark:bg-slate-900/50 text-slate-500 border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ticket List */}
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <p className="text-slate-500 font-medium">Fetching your tickets...</p>
                                        </div>
                                    ) : filteredTickets.length === 0 ? (
                                        <div className="bg-card dark:bg-slate-900/50 rounded-3xl border border-border p-12 text-center animate-in zoom-in-95 duration-300">
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Ticket size={40} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold dark:text-white mb-2">No tickets found</h3>
                                            <p className="text-slate-500 max-w-sm mx-auto">
                                                {search || filter !== 'all'
                                                    ? "Try adjusting your filters or search query."
                                                    : "You haven't created any support tickets yet. Click 'Contact Support' in your profile if you need help."}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredTickets.map((ticket, index) => (
                                            <div
                                                key={ticket._id}
                                                onClick={() => handleSelectTicket(ticket._id)}
                                                className="group bg-card dark:bg-slate-900/50 rounded-3xl border border-border p-6 hover:border-primary/50 cursor-pointer transition-all hover:shadow-xl hover:shadow-primary/5 animate-in slide-in-from-bottom-2 duration-300"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ticket.type === 'Email' ? 'bg-blue-50 text-blue-500' : 'bg-primary/10 text-primary'
                                                            }`}>
                                                            {ticket.type === 'Email' ? <LayoutGrid size={24} /> : <Ticket size={24} />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                                                    #{ticket.ticketId || ticket._id.slice(-6)}
                                                                </span>
                                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${getStatusStyle(ticket.status)}`}>
                                                                    {ticket.status}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg font-bold dark:text-white group-hover:text-primary transition-colors">
                                                                {ticket.subject}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Calendar size={14} />
                                                                    {new Date(ticket.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 line-clamp-1">
                                                                    <MessageSquare size={14} />
                                                                    {ticket.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                                                        <div className="text-right hidden md:block">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Last Updated</p>
                                                            <p className="text-xs font-medium dark:text-slate-300">
                                                                {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-transparent group-hover:border-primary/20">
                                                            <ChevronRight size={24} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Ticket Detail View */
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                {/* Detail Header */}
                                <div className="bg-card dark:bg-slate-900/50 p-6 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleBackToList}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                                        >
                                            <ArrowLeft size={24} className="text-slate-500 group-hover:text-primary" />
                                        </button>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                                    #{ticketDetails?.ticketId || selectedTicketId?.slice(-6)}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${getStatusStyle(ticketDetails?.status)}`}>
                                                    {ticketDetails?.status || 'Loading...'}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold dark:text-white">{ticketDetails?.subject || 'Loading Title...'}</h2>
                                        </div>
                                    </div>
                                    {ticketDetails && (
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 outline-none">Category</p>
                                                <p className="font-bold dark:text-slate-200">{ticketDetails.category}</p>
                                            </div>
                                            <div className="h-8 w-px bg-border"></div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Created On</p>
                                                <p className="font-bold dark:text-slate-200">{new Date(ticketDetails.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {loadingDetails ? (
                                    <div className="h-64 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="animate-spin text-primary" size={40} />
                                        <p className="text-slate-500">Loading conversation history...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Conversation area */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Initial Request */}
                                            <div className="bg-card dark:bg-slate-900/50 rounded-3xl border border-border overflow-hidden">
                                                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-border flex items-center gap-2">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <span className="text-xs font-bold uppercase text-slate-400">Initial Description</span>
                                                </div>
                                                <div className="p-6">
                                                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{ticketDetails?.description}</p>
                                                </div>
                                            </div>

                                            {/* Messages Thread */}
                                            <div className="space-y-4">
                                                {ticketDetails?.messages?.map((msg, idx) => {
                                                    const isAdmin = msg.senderModel === 'AdminUser';
                                                    return (
                                                        <div key={idx} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                                                            <div className={`max-w-[85%] space-y-2`}>
                                                                <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAdmin ? 'bg-primary/20 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                                                        {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                                        {isAdmin ? (msg.sender?.userId?.name || 'Support Team') : 'You'}
                                                                    </span>
                                                                    <span className="text-[9px] text-slate-400">{new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                                                                </div>
                                                                <div className={`p-4 rounded-2xl shadow-sm border ${isAdmin
                                                                        ? 'bg-white dark:bg-slate-800 border-border text-slate-800 dark:text-slate-100 rounded-tl-none'
                                                                        : 'bg-primary text-white border-primary/20 rounded-tr-none'
                                                                    }`}>
                                                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Reply Input */}
                                            {ticketDetails?.status !== 'Resolved' ? (
                                                <form onSubmit={handleSendReply} className="bg-card dark:bg-slate-900/50 p-4 rounded-3xl border border-border shadow-sm">
                                                    <textarea
                                                        placeholder="Write your follow-up message here..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        rows={3}
                                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white resize-none"
                                                    />
                                                    <div className="mt-3 flex justify-end">
                                                        <button
                                                            disabled={!replyText.trim() || isSubmittingReply}
                                                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                                                        >
                                                            {isSubmittingReply ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                            Send Reply
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-3xl text-center">
                                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Ticket Resolved</h4>
                                                    <p className="text-sm text-emerald-600 dark:text-emerald-500/70 mt-1">This ticket has been marked as resolved. If you still need help, please create a new ticket.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Activity Log / Sidebar Info */}
                                        <div className="space-y-6">
                                            <div className="bg-card dark:bg-slate-900/50 rounded-3xl border border-border p-6">
                                                <h4 className="text-sm font-bold dark:text-white flex items-center gap-2 mb-6">
                                                    <Clock size={16} className="text-primary" />
                                                    Activity Log
                                                </h4>
                                                <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                                                    {ticketDetails.history?.map((h, i) => (
                                                        <div key={i} className="relative pl-7 group">
                                                            <div className="absolute left-0 top-[6px] w-[16px] h-[16px] bg-card dark:bg-slate-900 border-2 border-primary rounded-full z-10" />
                                                            <p className="text-xs font-bold dark:text-white capitalize">{h.action.replace(/_/g, ' ')}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(h.timestamp).toLocaleString()}</p>
                                                            {h.performedBy && (
                                                                <p className="text-[10px] text-primary font-medium mt-1 italic">
                                                                    By {h.performedBy.userId?.name || 'Administrator'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-primary/5 rounded-3xl border border-primary/20 p-6">
                                                <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
                                                    <AlertCircle size={16} />
                                                    Assigned Support
                                                </h4>
                                                {ticketDetails.assignedTo ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {ticketDetails.assignedTo.userId?.name?.[0] || 'A'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold dark:text-white">{ticketDetails.assignedTo.userId?.name}</p>
                                                            <p className="text-[10px] text-slate-500">Official Support Agent</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-500 italic">Waiting for assignment to a support agent...</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SupportTickets;
