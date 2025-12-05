// src/components/SingleNotes.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Play, CheckCircle, BookOpen, Video, X, Lock } from "lucide-react";
import { classData, markLectureWatched, markNoteRead } from "../../classData";
import API from "../../api/axios";

function SingleNotes() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Notes");
  const [content, setContent] = useState({ notes: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [subjectProgress, setSubjectProgress] = useState(0);
  const [trackedItems, setTrackedItems] = useState({ notes: [], videos: [] });
  const [pendingMarks, setPendingMarks] = useState({ notes: {}, videos: {} });

  // PDF Viewer State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
  const [currentPdfTitle, setCurrentPdfTitle] = useState("");

  // Enable security when modal is open
  useSecurity(showPdfModal);

  const currentClass = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        return userData.class || 9;
      } catch {
        return 9;
      }
    }
    return 9;
  }, []);

  // Get subject info from static data (including sub-subjects)
  const subject = useMemo(() => {
    const allSubjects = Object.values(classData).flatMap((cls) => cls.subjects);

    // First check main subjects
    const mainSubject = allSubjects.find((s) => s.id === parseInt(subjectId, 10));
    if (mainSubject) return mainSubject;

    // Then check sub-subjects (like Physics, Chemistry, Biology under Science)
    for (const subj of allSubjects) {
      if (subj.hasSubSubjects && subj.subSubjects) {
        const subSubject = subj.subSubjects.find((ss) => ss.id === parseInt(subjectId, 10));
        if (subSubject) return subSubject;
      }
    }

    return null;
  }, [subjectId]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);

        // Check if subject has local notes from classData
        if (subject && subject.notes && subject.notes.length > 0) {
          setContent({ notes: subject.notes, videos: [] });
        } else {
          // Fallback to API
          const response = await API.get(
            `/subjectNotes/getContent?subjectId=${subjectId}&classId=${currentClass}`
          );
          setContent(response.data || { notes: [], videos: [] });
        }

        const progressResp = await API.get(
          `/progress/getSubjectProgress?classId=${currentClass}`
        );

        const subjectProg = Array.isArray(progressResp.data)
          ? progressResp.data.find((p) => p.subjectId === parseInt(subjectId, 10))
          : null;

        if (subjectProg) {
          setSubjectProgress(subjectProg.completion ?? 0);
          setTrackedItems({
            notes: Array.isArray(subjectProg.notesCompleted) ? subjectProg.notesCompleted : [],
            videos: Array.isArray(subjectProg.videosCompleted) ? subjectProg.videosCompleted : [],
          });
        } else {
          setSubjectProgress(0);
          setTrackedItems({ notes: [], videos: [] });
        }
      } catch (error) {
        console.error("Error loading content:", error);
        // If API fails but we have local notes, use them
        if (subject && subject.notes && subject.notes.length > 0) {
          setContent({ notes: subject.notes, videos: [] });
        }
      } finally {
        setLoading(false);
      }
    };

    if (subject) {
      loadContent();
    }
  }, [subjectId, currentClass, subject]);

  const handleViewPdf = (url, title) => {
    // Ensure absolute URL for local files
    let fileUrl = url;
    if (fileUrl && !fileUrl.startsWith("http") && !fileUrl.startsWith("blob:")) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:3000";
      fileUrl = `${baseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
    }

    setCurrentPdfUrl(fileUrl);
    setCurrentPdfTitle(title);
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    setCurrentPdfUrl(null);
    setCurrentPdfTitle("");
  };

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-600 font-medium">Subject not found</p>
          <button
            onClick={() => navigate("/notes")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500">Loading content...</span>
        </div>
      </div>
    );
  }

  // util: google drive id
  const getGoogleDriveId = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // util: youtube id
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Reload progress data from backend
  const reloadProgress = async () => {
    try {
      const progressResp = await API.get(
        `/progress/getSubjectProgress?classId=${currentClass}`
      );

      const subjectProg = Array.isArray(progressResp.data)
        ? progressResp.data.find((p) => p.subjectId === parseInt(subjectId, 10))
        : null;

      if (subjectProg) {
        setSubjectProgress(subjectProg.completion ?? 0);
        setTrackedItems({
          notes: Array.isArray(subjectProg.notesCompleted) ? subjectProg.notesCompleted : [],
          videos: Array.isArray(subjectProg.videosCompleted) ? subjectProg.videosCompleted : [],
        });
      }
    } catch (error) {
      console.error("Error reloading progress:", error);
    }
  };

  // Mark note handler
  const handleMarkNote = async (noteId) => {
    console.log("handleMarkNote called with noteId:", noteId);

    if (trackedItems.notes.some(id => String(id) === String(noteId))) {
      console.log("Note already tracked, skipping");
      return;
    }
    if (pendingMarks.notes && pendingMarks.notes[noteId]) {
      console.log("Note already pending, skipping");
      return;
    }

    setPendingMarks((p) => ({ ...p, notes: { ...(p.notes || {}), [noteId]: true } }));

    try {
      console.log("Calling markNoteRead API...");
      const resp = await markNoteRead({
        subjectId: parseInt(subjectId, 10),
        classId: currentClass,
        noteId,
        totalNotes: content.notes.length,
        totalLectures: content.videos.length,
      });

      console.log("markNoteRead response:", resp);

      // Reload progress from backend to ensure data is persisted
      await reloadProgress();
    } catch (err) {
      console.error("Error marking note as read:", err);
      // Still update UI optimistically even if API fails
      setTrackedItems((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), noteId],
      }));
    } finally {
      setPendingMarks((p) => {
        const next = { ...(p || {}) };
        if (next.notes) {
          delete next.notes[noteId];
        }
        return next;
      });
    }
  };

  // Mark video handler
  const handleMarkVideo = async (videoId) => {
    if (trackedItems.videos.some(id => String(id) === String(videoId))) return;
    if (pendingMarks.videos && pendingMarks.videos[videoId]) return;

    setPendingMarks((p) => ({ ...p, videos: { ...(p.videos || {}), [videoId]: true } }));

    try {
      const resp = await markLectureWatched({
        subjectId: parseInt(subjectId, 10),
        classId: currentClass,
        videoId,
        totalNotes: content.notes.length,
        totalLectures: content.videos.length,
      });

      // Reload progress from backend to ensure data is persisted
      await reloadProgress();
    } catch (err) {
      console.error("Error marking video as watched:", err);
      // Still update UI optimistically even if API fails
      setTrackedItems((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), videoId],
      }));
    } finally {
      setPendingMarks((p) => {
        const next = { ...(p || {}) };
        if (next.videos) {
          delete next.videos[videoId];
        }
        return next;
      });
    }
  };

  const getSubjectGradient = () => {
    if (subject.color === "purple") return "from-purple-500 to-purple-600";
    if (subject.color === "green") return "from-green-500 to-green-600";
    return "from-blue-500 to-blue-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/notes")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Subjects
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getSubjectGradient()} flex items-center justify-center text-3xl shadow-md`}>
                  {subject.icon}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{subject.name}</h1>
                  <p className="text-gray-500">{content.notes.length} Chapters available</p>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-xl">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#22c55e"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - subjectProgress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">{subjectProgress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overall Progress</p>
                  <p className="text-sm font-medium text-gray-700">
                    {trackedItems.notes.length + trackedItems.videos.length} / {content.notes.length + content.videos.length} completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "Notes", icon: BookOpen, count: content.notes.length },
            { key: "Videos", icon: Video, count: content.videos.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              <tab.icon size={18} />
              {tab.key}
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-blue-500" : "bg-gray-200"
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === "Notes" && (
            <>
              {content.notes.length > 0 ? (
                content.notes.map((note, index) => {
                  const noteId = note._id || note.id;
                  const driveId = getGoogleDriveId(note.fileUrl);
                  const localFile = note.file; // For local PDFs
                  const driveUrl = driveId ? `https://drive.google.com/file/d/${driveId}/view` : null;
                  const pdfUrl = localFile || driveUrl || note.fileUrl;
                  const isDone = trackedItems.notes.some(id => String(id) === String(noteId));
                  const isPending = pendingMarks.notes && pendingMarks.notes[noteId];

                  return (
                    <div
                      key={noteId}
                      onClick={() => pdfUrl && handleViewPdf(pdfUrl, note.title)}
                      className={`bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md cursor-pointer group ${isDone ? "border-green-300 bg-green-50/50" : "border-gray-200 hover:border-blue-400"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDone
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                            }`}>
                            {isDone ? <CheckCircle size={22} /> : <FileText size={22} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-400">Ch {index + 1}</span>
                              <h3 className="text-gray-900 font-semibold truncate group-hover:text-blue-600 transition-colors">{note.title}</h3>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {note.fileType?.toUpperCase() || "PDF"} • Click to open
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkNote(noteId);
                            }}
                            disabled={isDone || isPending}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDone
                              ? "bg-green-100 text-green-700 cursor-default"
                              : isPending
                                ? "bg-blue-400 text-white cursor-wait"
                                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                              }`}
                          >
                            {isDone ? "✓ Done" : isPending ? "..." : "Mark Read"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-600 font-medium">No notes available yet</p>
                  <p className="text-gray-400 text-sm mt-1">Notes will appear here once uploaded</p>
                </div>
              )}
            </>
          )}

          {activeTab === "Videos" && (
            <>
              {content.videos.length > 0 ? (
                content.videos.map((video, index) => {
                  const videoId = getYouTubeId(video.youtubeUrl);
                  const isDone = trackedItems.videos.some(id => String(id) === String(video._id));
                  const isPending = pendingMarks.videos && pendingMarks.videos[video._id];

                  return (
                    <div
                      key={video._id}
                      className={`bg-white rounded-xl p-5 border transition-all duration-300 hover:shadow-lg ${isDone ? "border-green-300 bg-green-50/50" : "border-gray-200 hover:border-blue-300"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDone ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}>
                            {isDone ? <CheckCircle size={20} /> : <Play size={20} />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
                            <p className="text-xs text-gray-500">Video Lecture</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkVideo(videoId)}
                          disabled={isDone || isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDone
                            ? "bg-green-100 text-green-700 cursor-default"
                            : isPending
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                          {isDone ? "Watched" : isPending ? "..." : "Mark Watched"}
                        </button>
                      </div>

                      <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-100 group">
                        {videoId ? (
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <p>Video unavailable</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-gray-600 font-medium">No videos available yet</p>
                  <p className="text-gray-400 text-sm mt-1">Video lectures will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Secure PDF Viewer Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 select-none">
              <div className="flex items-center gap-2 text-gray-700">
                <Lock size={16} className="text-green-600" />
                <h3 className="font-semibold truncate max-w-md">{currentPdfTitle}</h3>
              </div>
              <button
                onClick={closePdfModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* PDF Container */}
            <div
              className="flex-1 relative bg-gray-200 overflow-hidden"
              onContextMenu={(e) => e.preventDefault()} // Disable right click
            >
              {/* Transparent Overlay to discourage dragging/saving */}
              <div className="absolute inset-0 z-10 bg-transparent" style={{ pointerEvents: 'none' }}></div>

              {/* Dynamic Watermark */}
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-wrap content-center justify-center overflow-hidden opacity-10 select-none">
                {Array.from({ length: 6 }).map((_, i) => {
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  return (
                    <div key={i} className="w-full flex justify-around my-20 transform -rotate-45">
                      <span className="text-xl font-medium text-gray-400 whitespace-nowrap">
                        Issued to: {user.name || "Student"} • {user.phone || user.email || "ID: " + (user._id || "Unknown")}
                      </span>
                      <span className="text-xl font-medium text-gray-400 whitespace-nowrap">
                        Issued to: {user.name || "Student"} • {user.phone || user.email || "ID: " + (user._id || "Unknown")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <iframe
                src={`${currentPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full"
                title="PDF Viewer"
                style={{ border: 'none' }}
              />
            </div>

            {/* Security Footer */}
            <div className="p-2 bg-gray-900 text-white text-xs text-center select-none">
              Educational Material • Distributed by Sarvottam Institute • For Personal Use Only
            </div>
          </div>
        </div>
      )
      }
    </div >
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

    const handleBlur = () => {
      document.body.style.filter = "blur(10px)";
    };

    const handleFocus = () => {
      document.body.style.filter = "none";
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.body.style.filter = "none"; // Cleanup
    };
  }, [isActive]);
};

export default SingleNotes;
