import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Edit, MoreHorizontal,
    Smile, Paperclip, Send, Image, Lock, MessageSquare, X, File,
    Check, CheckCheck, Trash2, Slash, Eraser, ChevronLeft
} from 'lucide-react';
import API from '../../api/axios';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import defaultUser from '../../../assets/default-user.png';

const AdminChat = () => {
    // State
    const [chats, setChats] = useState([]); // Active chats
    const [activeChat, setActiveChat] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);

    // UI State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch conversations (recent chats)
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await API.get('/message/conversations');
                if (response.data.success) {
                    setChats(response.data.data.map(chat => ({
                        ...chat,
                        time: new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

    // Fetch Messages & Poll for updates
    useEffect(() => {
        let interval;
        if (activeChat) {
            const fetchMessages = async () => {
                try {
                    const response = await API.get(`/message/${activeChat.id}`);
                    if (response.data.success) {
                        const fetchedMessages = response.data.data;
                        setMessages(fetchedMessages.map(msg => ({
                            id: msg._id,
                            text: msg.content,
                            sender: (msg.sender?._id || msg.sender)?.toString() === activeChat.id.toString() ? 'them' : 'me',
                            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            status: msg.status,
                            file: msg.file
                        })));

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

    const getUserAvatarUrl = (user) => {
        if (!user.profilePicture) return null;
        if (user.profilePicture.startsWith('http')) return user.profilePicture;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return `${baseUrl}${user.profilePicture}`;
    };

    const getAvatarInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
    }

    const handleStartChat = (user) => {
        const existingChat = chats.find(c => c.id === user._id);
        if (existingChat) {
            setActiveChat(existingChat);
        } else {
            const newChat = {
                id: user._id,
                name: user.name,
                avatar: getAvatarInitials(user.name),
                profilePicture: user.profilePicture, // Include profilePicture
                lastMessage: "Start a conversation",
                time: "Now",
                unread: 0,
                status: 'online',
                isBlocked: false
            };
            setChats([newChat, ...chats]);
            setActiveChat(newChat);
        }
        setSearchQuery("");
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
                    <div className={`absolute bottom-0 right-0 w-[25%] h-[25%] rounded-full border-2 border-white ${chatOrUser.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                )}
            </div>
        );
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
                receiverId: activeChat.id,
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

    return (
        <div className="flex-1 flex h-full min-h-0 bg-white lg:rounded-3xl lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:border border-slate-100 overflow-hidden animate__animated animate__fadeIn">
            {/* Chat List Side (Hidden on mobile if a chat is active) */}
            <div className={`${isMobile && activeChat ? 'hidden' : 'flex'} w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10`}>
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Chat</h2>
                    <div className="flex gap-1">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <Edit size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#6264A7] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-[#6264A7]/20 focus:outline-none text-sm transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    {searchQuery ? (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 px-4 py-2 uppercase tracking-wider">
                                {isSearching ? "Searching..." : `Found ${searchResults.length} results`}
                            </h3>
                            {searchResults.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => handleStartChat(user)}
                                    className="flex items-center gap-3 p-3 h-[72px] min-h-[72px] flex-shrink-0 cursor-pointer rounded-xl hover:bg-gray-50 transition-all duration-200"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 overflow-hidden">
                                        <img src={getUserAvatarUrl(user) || defaultUser} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        chats.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-60">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <MessageSquare size={24} className="text-gray-300" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">No chats yet</h3>
                                <p className="text-xs text-gray-500 mt-1">Search for a student to start a conversation.</p>
                            </div>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChat(chat)}
                                    className={`flex items-center gap-3 p-3 h-[72px] min-h-[72px] flex-shrink-0 cursor-pointer rounded-xl transition-all duration-200 ${activeChat?.id === chat.id
                                        ? 'bg-[#E8EBFA]'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {renderAvatar(chat, "w-12 h-12", "text-sm", true)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={`text-sm font-semibold truncate ${activeChat?.id === chat.id ? 'text-[#6264A7]' : 'text-gray-900'}`}>{chat.name}</h3>
                                            <span className={`text-[10px] ${activeChat?.id === chat.id ? 'text-[#6264A7]/70' : 'text-gray-400'}`}>{chat.time}</span>
                                        </div>
                                        <p className={`text-xs truncate leading-tight ${chat.unread > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
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

            {/* Chat Window Side (Hidden on mobile if no chat is active) */}
            <div className={`${isMobile && !activeChat ? 'hidden' : 'flex'} flex-1 flex flex-col bg-white overflow-hidden`}>
                {activeChat ? (
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="h-16 lg:h-20 border-b border-gray-100 flex justify-between items-center px-4 lg:px-8 shadow-sm bg-white/50 backdrop-blur-md z-10">
                            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
                                {isMobile && (
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                )}

                                {renderAvatar(activeChat, "w-10 h-10", "text-xs lg:text-sm shadow-md", true)}

                                <div className="min-w-0">
                                    <h2 className="text-sm lg:text-lg font-bold text-gray-900 leading-tight truncate">{activeChat.name}</h2>
                                    <p className={`text-[10px] lg:text-xs font-medium ${activeChat.status === 'online' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {activeChat.status === 'online' ? 'Available' : 'Offline'}
                                        {activeChat.isBlocked && <span className="ml-2 text-red-500">(Blocked)</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 lg:gap-3">
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                    <Lock size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap">Encrypted</span>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowChatMenu(!showChatMenu)}
                                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    {showChatMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate__animated animate__fadeIn animate__faster">
                                            <button
                                                onClick={handleClearChat}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <Eraser size={16} className="text-blue-500" />
                                                Clear History
                                            </button>
                                            <button
                                                onClick={handleDeleteChat}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                                Delete Chat
                                            </button>
                                            <div className="my-1 border-t border-gray-100"></div>
                                            <button
                                                onClick={activeChat.isBlocked ? handleUnblockUser : handleBlockUser}
                                                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${activeChat.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                            >
                                                <Slash size={16} />
                                                {activeChat.isBlocked ? 'Unblock User' : 'Block User'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6 bg-white scrollbar-thin">
                            <div className="flex flex-col items-center gap-2 py-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Lock size={14} className="text-gray-400" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium text-center max-w-xs px-4">Messages are end-to-end encrypted and only visible to you and the student.</p>
                                <span className="bg-gray-100 text-gray-500 text-[10px] lg:text-xs px-3 py-1.5 rounded-full font-medium mt-2">Today</span>
                            </div>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex group ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-2 max-w-[85%] lg:max-w-[70%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                                            <div className={`p-3 lg:p-4 rounded-2xl shadow-sm text-sm lg:text-[15px] leading-relaxed relative ${msg.sender === 'me'
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
                                                <span className="text-[11px] text-gray-400 font-medium select-none">{msg.time}</span>
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

                        <div className="p-4 lg:p-6 bg-white border-t border-gray-100 relative">
                            {selectedFile && (
                                <div className="absolute bottom-full left-6 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg flex items-center gap-3">
                                    {selectedFile.type === 'image' ? (
                                        <img src={selectedFile.url} alt="Preview" className="w-12 h-12 object-cover rounded" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                            <File size={24} className="text-gray-500" />
                                        </div>
                                    )}
                                    <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                        <X size={16} className="text-gray-500" />
                                    </button>
                                </div>
                            )}

                            {showEmojiPicker && (
                                <div className="absolute bottom-24 left-6 z-20">
                                    <EmojiPicker onEmojiClick={onEmojiClick} width={isMobile ? "100%" : 300} height={400} />
                                </div>
                            )}

                            <div className="flex flex-col border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#6264A7]/20 focus-within:border-[#6264A7] transition-all bg-white">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full p-3 lg:p-4 bg-transparent outline-none text-sm lg:text-[15px] placeholder-gray-400 min-h-[50px] lg:min-h-[60px]"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                                <div className="flex justify-between items-center px-4 py-2 border-t border-gray-50 bg-[#F8F9FD] rounded-b-2xl">
                                    <div className="flex gap-1 text-gray-500">
                                        <button className="p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all" onClick={() => toast.success("Feature coming soon")}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all" onClick={triggerFileUpload}>
                                            <Paperclip size={18} />
                                        </button>
                                        <button className={`p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all ${showEmojiPicker ? 'text-[#6264A7] bg-white' : ''}`} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                            <Smile size={18} />
                                        </button>
                                        <button className="hidden sm:block p-2 hover:bg-white hover:text-[#6264A7] rounded-lg transition-all" onClick={() => { fileInputRef.current.accept = "image/*"; triggerFileUpload(); }}>
                                            <Image size={18} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() && !selectedFile}
                                        className={`p-2 lg:p-2.5 rounded-xl transition-all duration-200 ${messageInput.trim() || selectedFile ? 'bg-[#6264A7] text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-6">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 lg:mb-6 border border-gray-100">
                            <MessageSquare size={36} className="lg:size-48 text-[#6264A7] opacity-20" />
                        </div>
                        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Select a Student</h2>
                        <p className="text-gray-500 max-w-sm text-center text-xs lg:text-sm">Choose a student from the list to start a conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
