import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { videoLearningData } from "../../videoLearningData";
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Play } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const VideoPlayerPage = () => {
    const { subjectId, branchId, chapterId, videoId } = useParams();
    const navigate = useNavigate();

    // Mapping for backend IDs (from classData.js)
    const backendSubjectIds = {
        maths: 3,
        science: {
            physics: 41,
            chemistry: 42,
            biology: 43
        }
    };

    const [currentVideo, setCurrentVideo] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isWatched, setIsWatched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progressStats, setProgressStats] = useState({ completed: 0, total: 0, percentage: 0 });

    // Get current subject/branch ID for API
    const getBackendIDs = () => {
        let sid = null;
        if (subjectId === 'maths') sid = backendSubjectIds.maths;
        else if (subjectId === 'science' && branchId) sid = backendSubjectIds.science[branchId];
        return sid;
    };

    const backendSubjectId = useMemo(() => getBackendIDs(), [subjectId, branchId]);

    // Load Video Data
    useEffect(() => {
        if (!subjectId || !chapterId || !videoId) return;

        const subjectData = videoLearningData.class10[subjectId];
        if (!subjectData) return;

        let chapter = null;

        if (subjectId === 'maths') {
            chapter = subjectData.find(c => c.id === chapterId);
        } else if (subjectId === 'science' && branchId) {
            const branchData = subjectData[branchId];
            if (branchData) chapter = branchData.find(c => c.id === chapterId);
        }

        if (chapter) {
            const index = chapter.videos.findIndex(
                v => (getYoutubeId(v.url) || v.url) === videoId || getYoutubeId(v.url) === videoId
            );

            // Note: videoId param might be the youtubeID or index? 
            // In VideoList.jsx I should pass the youtube ID. 
            // Let's assume videoId param IS the specific identifier (youtube ID)

            setPlaylist(chapter.videos);

            if (index !== -1) {
                setCurrentIndex(index);
                setCurrentVideo(chapter.videos[index]);
                // Check watched status and fetch specific subject progress
                fetchProgress(chapter.videos[index]);
            } else {
                // Fallback: try to find by raw URL if param matches?
                // For now assume perfect match logic in VideoList.
            }
        }
    }, [subjectId, branchId, chapterId, videoId]);

    // Helper functions
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const fetchProgress = async (video) => {
        if (!backendSubjectId) return;
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const classId = user.class || 10;

            const res = await API.get(`/progress/getSubjectProgress?classId=${classId}`);

            if (res.data) {
                const prog = res.data.find(p => p.subjectId === backendSubjectId);

                // Calculate display stats
                if (prog) {
                    // Note: This matches how SingleNotes calculates it, assuming totalItems passed to backend was correct
                    // Ideally we should calculate 'total' from our local data + notes count if we want to match SingleNotes exactly.
                    // But here, let's just show completion percentage provided by backend or calculate based on local playlist? 
                    // The user wants "percentage completed in maths/science same as notes section".

                    // SingleNotes: displayPercentage = (completedItems / totalItems) * 100
                    // Let's rely on backend 'completion' field if accurate, matches the circle.
                    setProgressStats({
                        completed: (prog.notesCompleted?.length || 0) + (prog.videosCompleted?.length || 0),
                        // We don't have totalNotes here easily unless we fetch classData, 
                        // so let's use the 'completion' percentage directly from backend which should be accurate if marked correctly.
                        percentage: prog.completion || 0
                    });

                    // Check if current video is watched
                    if (prog.videosCompleted) {
                        const vidId = getYoutubeId(video.url);
                        if (prog.videosCompleted.includes(vidId)) {
                            setIsWatched(true);
                            return;
                        }
                    }
                } else {
                    setProgressStats({ completed: 0, total: 0, percentage: 0 });
                }
            }
            setIsWatched(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkWatched = async () => {
        if (isWatched || !currentVideo || !backendSubjectId) return;

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const classId = user.class || 10;
            const vidId = getYoutubeId(currentVideo.url);

            await API.post("/progress/markLectureWatched", {
                subjectId: backendSubjectId,
                classId: classId,
                videoId: vidId,
                totalNotes: 0,
                totalLectures: playlist.length // This updates the total count in backend if needed
            });

            setIsWatched(true);
            toast.success("Marked as Watched!");
            // Refresh progress
            fetchProgress(currentVideo);
        } catch (error) {
            toast.error("Failed to mark watched");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < playlist.length - 1) {
            const nextVid = playlist[currentIndex + 1];
            const nextId = getYoutubeId(nextVid.url);
            navigate(generatePath(nextId));
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            const prevVid = playlist[currentIndex - 1];
            const prevId = getYoutubeId(prevVid.url);
            navigate(generatePath(prevId));
        }
    };

    const generatePath = (vidId) => {
        if (subjectId === 'maths') {
            return `/video-learning/watch/maths/${chapterId}/${vidId}`;
        } else {
            return `/video-learning/watch/science/${branchId}/${chapterId}/${vidId}`;
        }
    };

    if (!currentVideo) return <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center">Loading Video...</div>;

    const ytId = getYoutubeId(currentVideo.url);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
            {/* Navbar with Progress */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-6 py-3 flex items-center justify-between shadow-sm z-10 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.close()} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition" title="Close Tab">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-base md:text-lg leading-tight text-slate-900 dark:text-white">{currentVideo.title}</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {subjectId.charAt(0).toUpperCase() + subjectId.slice(1)} • {chapterId.replace(/-/g, ' ')}
                        </p>
                    </div>
                </div>

                {/* Right Side: Progress & Action */}
                <div className="flex items-center gap-2 md:gap-6">
                    {/* Progress Indicator */}
                    <div className="flex flex-col items-end min-w-[100px] md:min-w-[140px]">
                        <div className="flex items-center justify-between w-full text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span className="hidden sm:inline">Subject Progress</span>
                            <span className="sm:hidden">Progress</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">{progressStats.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${progressStats.percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden md:block"></div>

                    <button
                        onClick={handleMarkWatched}
                        disabled={isWatched || loading}
                        className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95 ${isWatched ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 cursor-default" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                    >
                        {loading ? "..." : isWatched ? <><CheckCircle size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Watched</span></> : <span className="whitespace-nowrap">Mark Done</span>}
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 overflow-hidden">
                {/* Main Player Area */}
                <div className="flex-1 flex flex-col relative group bg-black">
                    <div className="flex-1 bg-black relative flex items-center justify-center">
                        <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
                            className="absolute inset-0 w-full h-full"
                            title={currentVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Controls / Info */}
                    <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 flex items-center justify-between relative z-10 transition-colors duration-300">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                            <ChevronLeft /> Previous
                        </button>

                        <div className="text-center">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Video {currentIndex + 1} of {playlist.length}</span>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentIndex === playlist.length - 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                            Next <ChevronRight />
                        </button>
                    </div>
                </div>

                {/* Playlist Sidebar */}
                <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 overflow-y-auto hidden lg:block transition-colors duration-300">
                    <div className="p-4 font-bold border-b border-slate-200 dark:border-white/10 text-sm tracking-wide text-slate-500 dark:text-slate-400 uppercase">Up Next</div>
                    <div className="p-2 space-y-1">
                        {playlist.map((video, idx) => {
                            const vidId = getYoutubeId(video.url);
                            const isActive = idx === currentIndex;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => navigate(generatePath(vidId))}
                                    className={`p-3 rounded-lg cursor-pointer flex gap-3 transition group ${isActive ? "bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/30" : "hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent"}`}
                                >
                                    <div className={`mt-1 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400"}`}>
                                        <Play size={12} fill={isActive ? "currentColor" : "none"} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className={`text-sm font-medium line-clamp-2 ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"}`}>{video.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{video.duration}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerPage;
