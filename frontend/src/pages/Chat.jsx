import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Search, Edit, MoreHorizontal,
    Smile, Paperclip, Send, Image, Lock, MessageSquare, X, File,
    Check, CheckCheck, Trash2, Slash, Eraser, ArrowLeft,
    Pin, PinOff, Volume2, VolumeX, Mail, MailOpen, Info, User, MailCheck
} from 'lucide-react';
import API from '../api/axios';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import defaultUser from '../assets/default-user.png';

const Chat = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [chats, setChats] = useState([]); // Active chats
    const [activeChat, setActiveChat] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);

    // UI State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const chatMenuRef = useRef(null);
    const sidebarMenuRef = useRef(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const scrollRef = useRef(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [showSidebarMenu, setShowSidebarMenu] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);

    // Group Member Search State
    const [memberSearchQuery, setMemberSearchQuery] = useState("");
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);
    const [selectedMemberObjects, setSelectedMemberObjects] = useState([]); // To display chips with names

    // Fetch conversations (recent chats)
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await API.get('/message/conversations');
                if (response.data.success) {
                    setChats(response.data.data.map(chat => ({
                        ...chat,
                        time: chat.time ? new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            scrollRef.current?.scrollIntoView({ behavior: isInitialLoad ? "auto" : "smooth" });
            setIsInitialLoad(false);
        }
    }, [messages]);

    // Reset initial load on chat change
    useEffect(() => {
        setIsInitialLoad(true);
    }, [activeChat]);

    // Handle click outside for Emoji Picker and Chat Menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close Emoji Picker if clicking outside
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                // Ensure we don't close it if we're clicking the toggle button
                if (!event.target.closest('button')?.contains(event.target)) {
                    // This is a bit loose, but let's be more specific below
                }
                setShowEmojiPicker(false);
            }

            // Close Chat Menu if clicking outside
            if (showChatMenu && chatMenuRef.current && !chatMenuRef.current.contains(event.target)) {
                // Check if the click was on the toggle button
                const toggleButton = event.target.closest('button');
                const isToggleButton = toggleButton && toggleButton.contains(event.target) &&
                    (toggleButton.querySelector('svg')?.classList.contains('lucide-more-horizontal') ||
                        toggleButton.innerHTML.includes('lucide-more-horizontal'));

                if (!isToggleButton) {
                    setShowChatMenu(false);
                }
            }
            // Close Sidebar Menu if clicking outside
            if (showSidebarMenu && sidebarMenuRef.current && !sidebarMenuRef.current.contains(event.target)) {
                setShowSidebarMenu(false);
            }
        };

        if (showEmojiPicker || showChatMenu || showSidebarMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker, showChatMenu, showSidebarMenu]);

    // Handle deep linking from notifications
    useEffect(() => {
        if (location.state?.selectedChatId && chats.length > 0) {
            const linkedChat = chats.find(c => c.id === location.state.selectedChatId);
            if (linkedChat) {
                setActiveChat(linkedChat);
                // Clear state so we don't re-trigger on refresh if possible (though location state persists)
                // navigate('.', { replace: true, state: {} }); // Optional: clear state
            }
        }
    }, [chats, location.state]);

    // Fetch Messages & Poll for updates
    useEffect(() => {
        let interval;
        if (activeChat) {
            const fetchMessages = async () => {
                try {
                    const response = await API.get(`/message/${activeChat.id}?type=${activeChat.type || 'direct'}`);
                    if (response.data.success) {
                        const fetchedMessages = response.data.data;
                        let currentUserId = null;
                        try {
                            const user = JSON.parse(localStorage.getItem('user'));
                            currentUserId = user?._id;
                        } catch (e) {
                            console.error("Error parsing user from localStorage", e);
                        }

                        setMessages(fetchedMessages.map(msg => {
                            const msgSenderId = (msg.sender?._id || msg.sender)?.toString();
                            const isMe = currentUserId && msgSenderId === currentUserId.toString();
                            return {
                                id: msg._id,
                                text: msg.content,
                                sender: isMe ? 'me' : 'them',
                                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                status: msg.status,
                                file: msg.file,
                                senderName: msg.sender?.name
                            };
                        }));

                        // If there are unread messages from 'them', mark them as read
                        const hasUnread = fetchedMessages.some(m => (m.sender?._id || m.sender)?.toString() === activeChat.id.toString() && m.status !== 'read');
                        if (hasUnread) {
                            await API.put('/message/read', { senderId: activeChat.id });
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch messages", error);
                }
            };

            fetchMessages(); // Initial fetch
            interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeChat]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const response = await API.get(`/user/search?q=${searchQuery}`);
                    if (response.data.success) {
                        setSearchResults(response.data.data);
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);


    const handleStartChat = (user) => {
        const existingChat = chats.find(c => c.id === user._id);
        if (existingChat) {
            setActiveChat(existingChat);
        } else {
            const newChat = {
                id: user._id,
                name: user.name || "Unknown",
                avatar: (user.name || "U").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                profilePicture: user.profilePicture, // Include profilePicture
                lastMessage: "Start a conversation",
                time: new Date().toISOString(),
                unread: 0,
                status: 'online',
                isBlocked: false
            };
            setChats([newChat, ...chats]);
            setActiveChat(newChat);
        }
        setSearchQuery("");
    };

    const handleSendMessage = async () => {
        if ((!messageInput.trim() && !selectedFile) || !activeChat) return;

        if (activeChat.isBlocked) {
            toast.error("User is blocked");
            return;
        }

        const tempId = Date.now();
        const contentVal = messageInput;
        const optimisticMessage = {
            id: tempId,
            text: contentVal,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            file: selectedFile,
            status: 'sent'
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setMessageInput("");
        setSelectedFile(null);
        setShowEmojiPicker(false);

        try {
            const response = await API.post('/message/send', {
                receiverId: activeChat.type === 'direct' ? activeChat.id : undefined,
                groupId: activeChat.type === 'group' ? activeChat.id : undefined,
                content: contentVal,
                file: optimisticMessage.file
            });

            if (response.data.success) {
                const savedMsg = response.data.data;
                setMessages(prev => prev.map(msg => msg.id === tempId ? {
                    ...msg,
                    id: savedMsg._id,
                    status: savedMsg.status
                } : msg));
            }
        } catch (error) {
            console.error("Failed to send message", error);
            const errorMsg = error.response?.data?.message || "Failed to send message";
            toast.error(errorMsg);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    };

    const onEmojiClick = (emojiData) => {
        setMessageInput(prev => prev + emojiData.emoji);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setSelectedFile({
                name: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                url: URL.createObjectURL(file)
            });
        }
    };


    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleToggleUnread = () => toast.success("Marked as unread");
    const handleToggleMute = () => toast.success("Muted conversation");
    const handleTogglePin = () => toast.success("Pinned conversation");

    const handleClearChat = async () => {
        try {
            await API.delete(`/message/clear/${activeChat.id}`);
            setMessages([]);
            toast.success("Chat cleared");
            setShowChatMenu(false);
        } catch (error) {
            toast.error("Failed to clear chat");
        }
    };

    const handleDeleteChat = async () => {
        try {
            await API.delete(`/message/delete/${activeChat.id}`);
            setChats(prev => prev.filter(c => c.id !== activeChat.id));
            setActiveChat(null);
            toast.success("Chat deleted");
            setShowChatMenu(false);
        } catch (error) {
            toast.error("Failed to delete chat");
        }
    };

    const handleBlockUser = async () => {
        try {
            await API.post('/message/block', { userId: activeChat.id });
            setActiveChat(prev => ({ ...prev, isBlocked: true }));
            setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, isBlocked: true } : c));
            toast.success("User blocked");
            setShowChatMenu(false);
        } catch (error) {
            toast.error("Failed to block user");
        }
    };

    const handleUnblockUser = async () => {
        try {
            await API.post('/message/unblock', { userId: activeChat.id });
            setActiveChat(prev => ({ ...prev, isBlocked: false }));
            setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, isBlocked: false } : c));
            toast.success("User unblocked");
            setShowChatMenu(false);
        } catch (error) {
            toast.error("Failed to unblock user");
        }
    };

    const handleCompose = () => {
        const searchInput = document.querySelector('input[placeholder="Search people..."]');
        if (searchInput) searchInput.focus();
    };

    const handleMarkAllRead = async () => {
        try {
            await API.put('/message/read-all');
            setChats(prev => prev.map(c => ({ ...c, unread: 0 })));
            toast.success("All messages marked as read");
            setShowSidebarMenu(false);
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleClearAllChats = async () => {
        if (!window.confirm("Are you sure you want to clear all chat history?")) return;
        try {
            await API.delete('/message/clear-all');
            setChats([]);
            setActiveChat(null);
            toast.success("All chats cleared");
            setShowSidebarMenu(false);
        } catch (error) {
            toast.error("Failed to clear chats");
        }
    };

    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Debounced Member Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (memberSearchQuery.trim().length >= 2) {
                setIsSearchingMembers(true);
                try {
                    const response = await API.get(`/user/search?q=${memberSearchQuery}`);
                    if (response.data.success) {
                        setMemberSearchResults(response.data.data);
                    }
                } catch (error) {
                    console.error("Member search failed", error);
                } finally {
                    setIsSearchingMembers(false);
                }
            } else {
                setMemberSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [memberSearchQuery]);

    const handleCreateGroup = async () => {
        if (!groupName || selectedMembers.length < 1) {
            toast.error("Group name and at least 1 member required");
            return;
        }
        try {
            const response = await API.post('/message/create-group', {
                name: groupName,
                members: selectedMembers
            });
            if (response.data.success) {
                toast.success("Group created!");
                setShowCreateGroup(false);
                setGroupName("");
                setSelectedMembers([]);
                setSelectedMemberObjects([]);
                setMemberSearchQuery("");
                // Trigger refresh
                const refreshConv = await API.get('/message/conversations');
                if (refreshConv.data.success) {
                    setChats(refreshConv.data.data.map(chat => ({
                        ...chat,
                        time: chat.time ? new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                    })));
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to create group";
            toast.error(errorMsg);
        }
    };

    const toggleMember = (user) => {
        const userId = user._id || user.id;
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(prev => prev.filter(id => id !== userId));
            setSelectedMemberObjects(prev => prev.filter(u => (u._id || u.id) !== userId));
        } else {
            setSelectedMembers(prev => [...prev, userId]);
            setSelectedMemberObjects(prev => [...prev, user]);
        }
        setMemberSearchQuery(""); // Clear search after selection
        setMemberSearchResults([]);
    };

    const getUserAvatarUrl = (user) => {
        if (!user) return defaultUser;
        if (user.type === 'group') return user.avatar || defaultUser;
        return (typeof user.profilePicture === 'string' ? user.profilePicture : user.profilePicture?.url) || defaultUser;
    };

    // Helper for rendering avatar
    const renderAvatar = (chatOrUser, size = "w-12 h-12", textSize = "text-sm", isOnlineIndicator = true) => {
        const avatarUrl = getUserAvatarUrl(chatOrUser);
        const imageUrl = avatarUrl || defaultUser;

        return (
            <div className="relative flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={chatOrUser.name}
                    className={`${size} rounded-full object-cover shadow-sm border border-gray-100`}
                />

                {isOnlineIndicator && (
                    <div className={`absolute bottom-0 right-0 w-[25%] h-[25%] rounded-full border-2 border-white ${chatOrUser.status === 'online' ? 'bg-green-500' :
                        chatOrUser.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-poppins">
            <Sidebar />

            <div className="flex-1 flex ml-0 md:ml-[80px] lg:ml-[100px] p-0 md:p-6 lg:p-10 h-screen overflow-hidden">
                <div className="flex-1 flex bg-white dark:bg-slate-900 md:rounded-3xl shadow-none md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 md:border border-slate-100 dark:border-slate-800 overflow-hidden animate__animated animate__fadeIn relative">
                    {/* Chat List Sidebar */}
                    <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10`}>
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-transparent">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/')}
                                    className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Chat</h2>
                            </div>
                            <div className="flex gap-1">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                    {showSidebarMenu && (
                                        <div ref={sidebarMenuRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 animate__animated animate__fadeIn animate__faster">
                                            <button onClick={handleMarkAllRead} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                                                <MailCheck size={16} /> Mark all as read
                                            </button>
                                            <button onClick={handleClearAllChats} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3">
                                                <Trash2 size={16} /> Clear all chats
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowCreateGroup(true)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors"
                                >
                                    <Edit size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#6264A7] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search people..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-700 focus:border-gray-200 focus:ring-2 focus:ring-[#6264A7]/20 focus:outline-none text-sm transition-all shadow-sm text-gray-900 dark:text-gray-100"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Chat List or Search Results */}
                        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-20 md:pb-0">
                            {searchQuery ? (
                                // Search Results
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider">
                                        {isSearching ? "Searching..." : `Found ${searchResults.length} results`}
                                    </h3>
                                    {searchResults.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleStartChat(user)}
                                            className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 overflow-hidden">
                                                <img src={getUserAvatarUrl(user) || defaultUser} alt={user.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {!isSearching && searchResults.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            No users found
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Existing Chat List
                                chats.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-center px-4 mt-8">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <MessageSquare size={24} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900">No chats yet</h3>
                                        <p className="text-xs text-gray-500 mt-1">Start a conversation to see it here.</p>
                                    </div>
                                ) : (
                                    chats.map(chat => (
                                        <div
                                            key={chat.id}
                                            onClick={() => setActiveChat(chat)}
                                            className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 ${activeChat?.id === chat.id
                                                ? 'bg-[#E8EBFA] dark:bg-[#6264A7]/20 shadow-sm'
                                                : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                                }`}
                                        >
                                            {renderAvatar(chat, "w-12 h-12", "text-sm", true)}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={`text-sm font-semibold truncate ${activeChat?.id === chat.id ? 'text-[#6264A7] dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>{chat.name}</h3>
                                                    <div className="flex items-center gap-1">
                                                        {chat.isPinned && <Pin size={10} className="text-gray-400 rotate-45" />}
                                                        {chat.isMuted && <VolumeX size={10} className="text-gray-400" />}
                                                        <span className={`text-xs ${activeChat?.id === chat.id ? 'text-[#6264A7]/70 dark:text-blue-400/70' : 'text-gray-400'}`}>{chat.time}</span>
                                                    </div>
                                                </div>
                                                <p className={`text-xs truncate leading-relaxed ${chat.unread > 0
                                                    ? 'font-bold text-gray-900 dark:text-white'
                                                    : activeChat?.id === chat.id ? 'text-[#6264A7]/80 dark:text-blue-300 font-medium' : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {chat.lastMessage}
                                                </p>
                                            </div>
                                            {chat.unread > 0 && (
                                                <div className="w-5 h-5 rounded-full bg-[#CC4A31] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                                    {chat.unread}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-slate-900 overflow-hidden w-full h-full absolute md:relative z-20 md:z-auto`}>
                        {activeChat ? (
                            <>
                                {/* Header */}
                                <div className="h-20 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center px-4 md:px-8 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10">
                                    <div className="flex items-center gap-2 md:gap-4">
                                        {/* Back Button for Mobile */}
                                        <button
                                            onClick={() => setActiveChat(null)}
                                            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        </button>

                                        {renderAvatar(activeChat, "w-10 h-10", "text-xs", true)}

                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                {activeChat.name}
                                                {activeChat.isBlocked && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Blocked</span>}
                                            </h2>
                                            <span className={`text-xs font-medium ${activeChat.type === 'group' ? 'text-slate-500' : (activeChat.status === 'online' ? 'text-green-600' :
                                                activeChat.status === 'busy' ? 'text-red-500' : 'text-yellow-600')
                                                }`}>
                                                {activeChat.type === 'group'
                                                    ? `${activeChat.membersCount || 0} members`
                                                    : (activeChat.status === 'online' ? 'Available' : (activeChat.status ? activeChat.status.charAt(0).toUpperCase() + activeChat.status.slice(1) : 'Offline'))
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowChatMenu(!showChatMenu)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {showChatMenu && (
                                                <div ref={chatMenuRef} className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 animate__animated animate__fadeIn animate__faster">
                                                    <button onClick={handleToggleUnread} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                                                        {activeChat.isMarkedUnread ? <MailOpen size={16} /> : <Mail size={16} />}
                                                        {activeChat.isMarkedUnread ? 'Mark as read' : 'Mark as unread'}
                                                    </button>
                                                    <button onClick={handleToggleMute} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                                                        {activeChat.isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                                        {activeChat.isMuted ? 'Unmute' : 'Mute'}
                                                    </button>
                                                    <button onClick={handleTogglePin} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                                                        {activeChat.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                                                        {activeChat.isPinned ? 'Unpin' : 'Pin'}
                                                    </button>
                                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                                                        <User size={16} />
                                                        View Details
                                                    </button>

                                                    <div className="my-1 border-t border-gray-100 dark:border-slate-700"></div>

                                                    <button onClick={handleClearChat} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                                                        <Eraser size={16} className="text-blue-500" />
                                                        Clear History
                                                    </button>
                                                    <button onClick={handleDeleteChat} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                                                        <Trash2 size={16} className="text-red-500" />
                                                        Delete Chat
                                                    </button>

                                                    <div className="my-1 border-t border-gray-100 dark:border-slate-700"></div>

                                                    <button onClick={activeChat.isBlocked ? handleUnblockUser : handleBlockUser} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${activeChat.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}>
                                                        <Slash size={16} />
                                                        {activeChat.isBlocked ? 'Unblock User' : 'Block User'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={handleCompose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors" title="New Chat">
                                            <Edit size={20} />
                                        </button>

                                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700 ml-2">
                                            <Lock size={12} className="text-emerald-500" />
                                            <span className="text-[10px] font-medium text-gray-500">End-to-end Encrypted</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-white dark:bg-slate-900 scrollbar-thin scrollbar-thumb-gray-200 pb-32 md:pb-6">
                                    <div className="flex flex-col items-center gap-2 py-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Lock size={14} className="text-gray-400" />
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium text-center max-w-xs">Messages are end-to-end encrypted. No one outside of this chat, not even the admins, can read or listen to them.</p>
                                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full font-medium mt-2">Today</span>
                                    </div>
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex group ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {msg.sender !== 'me' && (
                                                    <div className="flex-shrink-0 self-end mb-1">
                                                        <img
                                                            src={getUserAvatarUrl(activeChat) || defaultUser}
                                                            alt={activeChat.name}
                                                            className="w-8 h-8 rounded-full object-cover bg-gray-100"
                                                        />
                                                    </div>
                                                )}
                                                <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${msg.sender === 'me'
                                                        ? 'bg-[#E8EBFA] text-gray-900 rounded-br-sm'
                                                        : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                                                        }`}>
                                                        {msg.file && (
                                                            <div className="mb-2">
                                                                {msg.file.type === 'image' ? (
                                                                    <img src={msg.file.url} alt="Shared" className="max-w-full h-auto rounded-lg" />
                                                                ) : (
                                                                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                                                                        <File size={20} className="text-[#6264A7]" />
                                                                        <span className="text-sm truncate max-w-[150px]">{msg.file.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p>{msg.text}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1.5 px-1">
                                                        <span className="text-[11px] text-gray-400 font-medium select-none">
                                                            {msg.time}
                                                        </span>
                                                        {msg.sender === 'me' && (
                                                            msg.status === 'read' ? (
                                                                <CheckCheck size={14} className="text-blue-500" />
                                                            ) : msg.status === 'delivered' ? (
                                                                <CheckCheck size={14} className="text-gray-400" />
                                                            ) : (
                                                                <Check size={14} className="text-gray-400" />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 relative mb-2 md:mb-0">
                                    {/* File Preview */}
                                    {selectedFile && (
                                        <div className="absolute bottom-full left-6 mb-2 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg flex items-center gap-3 text-gray-900 dark:text-gray-100">
                                            {selectedFile.type === 'image' ? (
                                                <img src={selectedFile.url} alt="Preview" className="w-12 h-12 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                    <File size={24} className="text-gray-500" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium truncate max-w-[150px]">{selectedFile.name}</span>
                                                <span className="text-xs text-gray-400">Ready to send</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className="p-1 hover:bg-gray-100 rounded-full"
                                            >
                                                <X size={16} className="text-gray-500" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Emoji Picker */}
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-24 left-6 z-20" ref={emojiPickerRef}>
                                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                        </div>
                                    )}

                                    <div className="flex flex-col border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#6264A7]/20 focus-within:border-[#6264A7] transition-all bg-white dark:bg-slate-800">
                                        <input
                                            type="text"
                                            placeholder="Type a new message..."
                                            className="w-full p-4 bg-transparent outline-none text-sm placeholder-gray-400 min-h-[60px] text-gray-900 dark:text-gray-100"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />

                                        <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-50 dark:border-slate-700 bg-[#F8F9FD] dark:bg-slate-800/50 rounded-b-2xl">
                                            <div className="flex gap-1 text-gray-500">
                                                <button
                                                    className="p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all hover:shadow-sm"
                                                    onClick={() => {
                                                        // Placeholder for edit functionality or expanding toolbar
                                                        toast.success("Rich text editing enabled");
                                                    }}
                                                    title="Format"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all hover:shadow-sm"
                                                    onClick={triggerFileUpload}
                                                    title="Attach file"
                                                >
                                                    <Paperclip size={18} />
                                                </button>
                                                <button
                                                    className={`p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all hover:shadow-sm ${showEmojiPicker ? 'text-[#6264A7] bg-white' : ''}`}
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    title="Emoji"
                                                >
                                                    <Smile size={18} />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all hover:shadow-sm"
                                                    onClick={() => {
                                                        // Usually image upload is same as file upload but filtering for images
                                                        fileInputRef.current.accept = "image/*";
                                                        triggerFileUpload();
                                                        // Reset accept after timeout
                                                        setTimeout(() => { if (fileInputRef.current) fileInputRef.current.accept = ""; }, 500);
                                                    }}
                                                    title="Image"
                                                >
                                                    <Image size={18} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleSendMessage}
                                                className={`p-2.5 rounded-xl transition-all duration-200 ${messageInput.trim() || selectedFile
                                                    ? 'bg-[#6264A7] text-white shadow-md hover:translate-y-[-1px]'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Send size={18} className={messageInput.trim() ? "translate-x-0.5 translate-y-0.5" : ""} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                    <MessageSquare size={48} className="text-[#6264A7]" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Chat</h2>
                                <p className="text-gray-500 max-w-sm text-center px-4">Select a conversation to start messaging or search for someone new.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate__animated animate__fadeIn animate__faster">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate__animated animate__zoomIn animate__faster">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Group</h3>
                            <button onClick={() => setShowCreateGroup(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Group Name</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Enter group name..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100 transition-all shadow-sm"
                                />
                            </div>

                            {/* Selected Members Chips */}
                            {selectedMemberObjects.length > 0 && (
                                <div className="flex flex-wrap gap-2 py-2">
                                    {selectedMemberObjects.map(user => {
                                        const userId = user._id || user.id;
                                        return (
                                            <div key={userId} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800">
                                                <span>{user.name}</span>
                                                <button onClick={() => toggleMember(user)} className="hover:text-blue-800 dark:hover:text-white transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Search Members</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={memberSearchQuery}
                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        placeholder="Type name or email..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100 transition-all shadow-sm"
                                    />
                                </div>

                                {/* Search Results Dropdown */}
                                {memberSearchQuery.trim().length >= 2 && (
                                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-[110] custom-scrollbar">
                                        {isSearchingMembers ? (
                                            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">Searching...</div>
                                        ) : memberSearchResults.length > 0 ? (
                                            memberSearchResults.map(user => (
                                                <div
                                                    key={user._id}
                                                    onClick={() => !selectedMembers.includes(user._id) && toggleMember(user)}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedMembers.includes(user._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <img src={getUserAvatarUrl(user) || defaultUser} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                                    </div>
                                                    {selectedMembers.includes(user._id) && <Check size={16} className="text-green-500" />}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No users found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateGroup(false);
                                    setMemberSearchQuery("");
                                    setMemberSearchResults([]);
                                }}
                                className="flex-1 px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                disabled={!groupName || selectedMembers.length < 1}
                                className="flex-1 px-4 py-3 font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
