// src/components/SingleNotes.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Play, CheckCircle, BookOpen, Video, Clock } from "lucide-react";
import { classData } from "../../classData";
import API from "../../api/axios";

// New API Helpers (could be in classData but defining here for clarity since they call our new endpoints)
const markNoteInProgressAPI = async (data) => API.post("/progress/markNoteInProgress", data);
const markLectureInProgressAPI = async (data) => API.post("/progress/markLectureInProgress", data);
const markNoteReadAPI = async (data) => API.post("/progress/markNoteRead", data);
const markLectureWatchedAPI = async (data) => API.post("/progress/markLectureWatched", data);

function SingleNotes() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Notes");
  const [content, setContent] = useState({ notes: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [subjectProgress, setSubjectProgress] = useState(0);

  // Tracked Items now tracks 'notes' (completed), 'videos' (completed), 'notesInProgress', 'videosInProgress'
  const [trackedItems, setTrackedItems] = useState({
    notes: [],
    videos: [],
    notesInProgress: [],
    videosInProgress: []
  });

  const [pendingMarks, setPendingMarks] = useState({ notes: {}, videos: {} });

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

    // Then check sub-subjects
    for (const subj of allSubjects) {
      if (subj.hasSubSubjects && subj.subSubjects) {
        const subSubject = subj.subSubjects.find((ss) => ss.id === parseInt(subjectId, 10));
        if (subSubject) return subSubject;
      }
    }

    return null;
  }, [subjectId]);

  // Get parent subject
  const parentSubject = useMemo(() => {
    const allSubjects = Object.values(classData).flatMap((cls) => cls.subjects);
    for (const subj of allSubjects) {
      if (subj.hasSubSubjects && subj.subSubjects) {
        const subSubject = subj.subSubjects.find((ss) => ss.id === parseInt(subjectId, 10));
        if (subSubject) return subj;
      }
    }
    return null;
  }, [subjectId]);

  const handleBack = () => {
    if (parentSubject) {
      navigate("/notes", { state: { selectedSubjectId: parentSubject.id } });
    } else {
      navigate("/notes");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        setLoading(true);

        // 1. Load Content (Notes/Videos)
        let loadedContent = { notes: [], videos: [] };
        if (subject && subject.notes && subject.notes.length > 0) {
          loadedContent = { notes: subject.notes, videos: [] };
        } else {
          // Fallback to API
          try {
            const response = await API.get(
              `/subjectNotes/getContent?subjectId=${subjectId}&classId=${currentClass}`
            );
            loadedContent = response.data || { notes: [], videos: [] };
          } catch (e) {
            console.warn("Failed to fetch content from API, keeping empty", e);
          }
        }

        if (isMounted) setContent(loadedContent);

        // 2. Load Progress
        const progressResp = await API.get(
          `/progress/getSubjectProgress?classId=${currentClass}`
        );

        if (isMounted) {
          const subjectProg = Array.isArray(progressResp.data)
            ? progressResp.data.find((p) => p.subjectId === parseInt(subjectId, 10))
            : null;

          if (subjectProg) {
            setSubjectProgress(subjectProg.completion ?? 0);
            setTrackedItems({
              notes: Array.isArray(subjectProg.notesCompleted) ? subjectProg.notesCompleted : [],
              videos: Array.isArray(subjectProg.videosCompleted) ? subjectProg.videosCompleted : [],
              notesInProgress: Array.isArray(subjectProg.notesInProgress) ? subjectProg.notesInProgress : [],
              videosInProgress: Array.isArray(subjectProg.videosInProgress) ? subjectProg.videosInProgress : []
            });
          } else {
            setSubjectProgress(0);
            setTrackedItems({ notes: [], videos: [], notesInProgress: [], videosInProgress: [] });
          }
        }

      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (subject) {
      loadContent();
    }
    return () => { isMounted = false; };
  }, [subjectId, currentClass, subject]);

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
          notesInProgress: Array.isArray(subjectProg.notesInProgress) ? subjectProg.notesInProgress : [],
          videosInProgress: Array.isArray(subjectProg.videosInProgress) ? subjectProg.videosInProgress : []
        });
      }
    } catch (error) {
      console.error("Error reloading progress:", error);
    }
  };

  const handleMarkNoteInProgress = async (noteId) => {
    // Prevent if already processing
    if (pendingMarks.notes && pendingMarks.notes[noteId]) return;

    setPendingMarks((p) => ({ ...p, notes: { ...(p.notes || {}), [noteId]: true } }));

    try {
      await markNoteInProgressAPI({
        subjectId: parseInt(subjectId, 10),
        classId: currentClass,
        noteId
      });
      await reloadProgress();
    } catch (e) {
      console.error("Failed to mark in progress", e);
    } finally {
      setPendingMarks((p) => {
        const next = { ...(p || {}) };
        if (next.notes) delete next.notes[noteId];
        return next;
      });
    }
  }

  const handleMarkNoteRead = async (noteId) => {
    if (pendingMarks.notes && pendingMarks.notes[noteId]) return;

    setPendingMarks((p) => ({ ...p, notes: { ...(p.notes || {}), [noteId]: true } }));

    try {
      await markNoteReadAPI({
        subjectId: parseInt(subjectId, 10),
        classId: currentClass,
        noteId,
        totalNotes: content.notes.length,
        totalLectures: content.videos.length,
      });

      await reloadProgress();
    } catch (err) {
      console.error("Error marking note as read:", err);
    } finally {
      setPendingMarks((p) => {
        const next = { ...(p || {}) };
        if (next.notes) delete next.notes[noteId];
        return next;
      });
    }
  };

  const handleMarkVideoWatched = async (videoId) => {
    // Logic for videos handled similarly if we were supporting video in-progress, 
    // but user asked for 'chapter' which usually means Notes in this context. 
    // We'll stick to Mark Watched for videos unless requested otherwise, 
    // but let's add helper for symmetry if needed. 
    // For now, implementing standard Mark Watched.
    if (pendingMarks.videos && pendingMarks.videos[videoId]) return;
    setPendingMarks((p) => ({ ...p, videos: { ...(p.videos || {}), [videoId]: true } }));

    try {
      await markLectureWatchedAPI({
        subjectId: parseInt(subjectId, 10),
        classId: currentClass,
        videoId,
        totalNotes: content.notes.length,
        totalLectures: content.videos.length,
      });
      await reloadProgress();
    } catch (e) {
      console.error("Error marking video", e);
    } finally {
      setPendingMarks((p) => {
        const next = { ...(p || {}) };
        if (next.videos) delete next.videos[videoId];
        return next;
      });
    }
  };

  const handleViewPdf = (url, title, noteId) => {
    let fileUrl = url;
    if (fileUrl && !fileUrl.startsWith("http") && !fileUrl.startsWith("blob:")) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:3000";
      fileUrl = `${baseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
    }

    navigate(`/notes/viewer/${noteId || 'view'}`, {
      state: { file: fileUrl, title: title, chapter: { title: title } }
    });
  };

  // Helper utils
  const getGoogleDriveId = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getSubjectGradient = () => {
    if (subject.color === "purple") return "from-purple-500 to-purple-600";
    if (subject.color === "green") return "from-green-500 to-green-600";
    return "from-blue-500 to-blue-600";
  };

  // Calculate display progress
  const totalItems = content.notes.length + content.videos.length;
  const completedItems = trackedItems.notes.length + trackedItems.videos.length;
  const displayPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;


  if (!subject) return <div className="p-8 text-center bg-background min-h-screen">Subject not found</div>;
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 md:mb-8">
          <button onClick={handleBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 group pl-12 md:pl-0">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to {parentSubject ? parentSubject.name : "Subjects"}</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${getSubjectGradient()} flex items-center justify-center text-2xl md:text-3xl shadow-md shrink-0`}>
                  {subject.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">{subject.name}</h1>
                  <p className="text-sm text-gray-500">{content.notes.length} Chapters available</p>
                </div>
              </div>

              {/* Progress Circle & Stats Container */}
              <div className="flex items-center gap-4 bg-gray-50 px-4 md:px-6 py-3 rounded-xl">
                <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0">
                  <svg className="w-12 h-12 md:w-16 md:h-16 -rotate-90">
                    <circle cx="24" cy="24" r="21" className="md:hidden" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                    <circle cx="24" cy="24" r="21" className="md:hidden" stroke="#22c55e" strokeWidth="4" fill="none"
                      strokeDasharray={`${2 * Math.PI * 21}`}
                      strokeDashoffset={`${2 * Math.PI * 21 * (1 - (displayPercentage / 100))}`}
                      strokeLinecap="round"
                    />
                    <circle cx="32" cy="32" r="28" className="hidden md:block" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                    <circle cx="32" cy="32" r="28" className="hidden md:block" stroke="#22c55e" strokeWidth="6" fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - (displayPercentage / 100))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm md:text-lg font-bold text-green-600">{displayPercentage}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Progress</p>
                  <p className="text-xs md:text-sm font-medium text-gray-700">{completedItems}/{totalItems} done</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("Notes")} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${activeTab === "Notes" ? "bg-blue-600 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            <BookOpen size={18} /> Notes <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{content.notes.length}</span>
          </button>
          <button onClick={() => setActiveTab("Videos")} className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${activeTab === "Videos" ? "bg-blue-600 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
            <Video size={18} /> Videos <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{content.videos.length}</span>
          </button>
        </div>

        <div className="space-y-3">
          {activeTab === "Notes" && (
            content.notes.length > 0 ? content.notes.map((note, idx) => {
              const noteId = note._id || note.id; // handle static vs dynamic ID
              const isDone = trackedItems.notes.some(id => String(id) === String(noteId));
              const isInProgress = trackedItems.notesInProgress && trackedItems.notesInProgress.some(id => String(id) === String(noteId));
              const isPending = pendingMarks.notes && pendingMarks.notes[noteId];

              // Determine Drive URL logic
              const driveId = getGoogleDriveId(note.fileUrl);
              const pdfUrl = note.file || (driveId ? `https://drive.google.com/file/d/${driveId}/view` : note.fileUrl);

              return (
                <div key={idx}
                  onClick={() => pdfUrl && handleViewPdf(pdfUrl, note.title, noteId)}
                  className={`bg-card rounded-xl p-4 border transition-all hover:shadow-md cursor-pointer group 
                        ${isDone ? "border-green-300 bg-green-50/40" :
                      isInProgress ? "border-blue-300 bg-blue-50/40" : "border-border hover:border-primary"}`}>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 
                          ${isDone ? "bg-green-100 text-green-600" :
                          isInProgress ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"}`}>
                        {isDone ? <CheckCircle size={20} /> : isInProgress ? <Clock size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-semibold text-gray-400 mt-1 shrink-0">Ch {idx + 1}</span>
                          <h3 className="text-sm md:text-base text-gray-900 font-semibold leading-snug">{note.title}</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {isDone ? "Completed" : isInProgress ? "In Progress" : "Not Started"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end sm:justify-start" onClick={(e) => e.stopPropagation()}>
                      {!isDone && !isInProgress && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkNoteInProgress(noteId);
                            if (pdfUrl) handleViewPdf(pdfUrl, note.title, noteId);
                          }}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        >
                          {isPending ? "..." : "Start"}
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkNoteRead(noteId);
                        }}
                        disabled={isDone || isPending}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all shadow-sm
                            ${isDone ? "bg-green-100 text-green-700 cursor-default" :
                            "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"}`}
                      >
                        {isDone ? "✓ Done" : isPending ? "..." : "Mark Complete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : <div className="text-center py-12 text-gray-500">No notes available</div>
          )}

          {activeTab === "Videos" && (
            content.videos.length > 0 ? content.videos.map((video, idx) => {
              const videoId = getYouTubeId(video.youtubeUrl) || video._id; // Fallback
              const isDone = trackedItems.videos.some(id => String(id) === String(videoId));
              const isPending = pendingMarks.videos && pendingMarks.videos[videoId];

              return (
                <div key={idx} className={`bg-white rounded-xl p-4 border transition-all ${isDone ? "border-green-300 bg-green-50/50" : "border-gray-200"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDone ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {isDone ? <CheckCircle size={20} /> : <Play size={20} />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 leading-snug">{video.title}</h3>
                        <p className="text-xs text-gray-500">Video Lecture</p>
                      </div>
                    </div>
                    <button onClick={() => handleMarkVideoWatched(videoId)} disabled={isDone || isPending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDone ? "bg-green-100 text-green-700 cursor-default" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {isDone ? "Watched" : isPending ? "..." : "Mark Watched"}
                    </button>
                  </div>
                  {videoId && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} title={video.title} allowFullScreen></iframe>
                    </div>
                  )}
                </div>
              )
            }) : <div className="text-center py-12 text-gray-500">No videos available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SingleNotes;
