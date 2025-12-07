import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, Bookmark, Lock, X } from "lucide-react";

function NotesViewer() {
    const { noteId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Get data from location state
    const chapter = location.state?.chapter;
    const fileUrl = location.state?.file;
    const title = location.state?.title || chapter?.title || "Notes";

    // Enable security
    useSecurity(true);

    useEffect(() => {
        if (!fileUrl) {
            // If no file URL, try to go back or show error
            console.error("No file URL provided");
            // navigate(-1); // Optional: redirect back immediately
        }
        setLoading(false);
    }, [fileUrl, navigate]);

    const handleDownload = () => {
        if (fileUrl) {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        try {
            const bookmarks = JSON.parse(localStorage.getItem("bookmarkedNotes") || "[]");
            if (!isBookmarked) {
                bookmarks.push({ id: noteId, title: title, file: fileUrl });
            } else {
                const index = bookmarks.findIndex(b => b.id === parseInt(noteId) || b.id === noteId);
                if (index > -1) bookmarks.splice(index, 1);
            }
            localStorage.setItem("bookmarkedNotes", JSON.stringify(bookmarks));
        } catch (error) {
            console.error("Error saving bookmark:", error);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: `Check out these notes: ${title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    if (!fileUrl) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-gray-600 font-medium">Notes file not found</p>
                    <p className="text-gray-400 text-sm mt-2">URL: {fileUrl || "undefined"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-400" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Lock size={16} className="text-green-500" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-100 line-clamp-1">
                                    {title}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBookmark}
                            className={`p-2 rounded-lg transition-colors ${isBookmarked
                                ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                : "hover:bg-slate-800 text-gray-400"
                                }`}
                            title="Bookmark"
                        >
                            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400"
                            title="Share"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400"
                            title="Download"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area - Full Height PDF Viewer */}
            <div className="flex-1 relative bg-white overflow-hidden min-h-0" onContextMenu={(e) => e.preventDefault()}>
                {/* Transparent Overlay to discourage dragging/saving */}
                <div className="absolute inset-0 z-20 bg-transparent" style={{ pointerEvents: 'none' }}></div>

                {/* Dynamic Watermark */}
                <div className="absolute inset-0 z-0 pointer-events-none flex flex-wrap content-center justify-center overflow-hidden opacity-10 select-none">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const user = JSON.parse(localStorage.getItem("user") || "{}");
                        return (
                            <div key={i} className="w-full flex justify-around my-20 transform -rotate-45">
                                <span className="text-xl font-medium text-gray-400 whitespace-nowrap">
                                    Issued to: {user.name || "Student"} • {user.phone || user.email || "ID: " + (user._id || "Unknown")}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <iframe
                    src={fileUrl}
                    className="absolute inset-0 w-full h-full block bg-white z-10"
                    title="PDF Viewer"
                    style={{ border: 'none' }}
                />
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white py-3 px-4 text-center text-xs select-none">
                <p>Educational Material • Distributed by Sarvottam Institute • For Personal Use Only</p>
                <p className="text-gray-500 mt-1">© {new Date().getFullYear()} Sarvottam Institute. All Rights Reserved.</p>
            </div>
        </div>
    );
}


// Security Hook for Anti-Screenshot
const useSecurity = (isActive) => {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e) => {
            // Block PrintScreen
            if (e.key === "PrintScreen") {
                e.preventDefault();
                alert("Screenshots are disabled for security reasons.");
                return;
            }

            // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+Shift+S (Snipping Tool shortcut on some OS)
            if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s" || (e.shiftKey && e.key === "s"))) {
                e.preventDefault();
                alert("This action is disabled.");
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isActive]);
};

export default NotesViewer;

