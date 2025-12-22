import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, CheckCircle } from "lucide-react";
import API from "../../api/axios";

const ChapterList = ({ chapters, subjectId, branchId }) => {
    const navigate = useNavigate();
    const [progressData, setProgressData] = useState(null);

    // Mapping for backend IDs (same as VideoPlayerPage)
    // Ideally this should be in a shared config
    const backendSubjectIds = {
        maths: 3,
        science: {
            physics: 41,
            chemistry: 42,
            biology: 43
        }
    };

    const getBackendIDs = () => {
        let sid = null;
        if (subjectId === 'maths') sid = backendSubjectIds.maths;
        else if (subjectId === 'science' && branchId) sid = backendSubjectIds.science[branchId];
        return sid;
    };

    const backendSubjectId = useMemo(() => getBackendIDs(), [subjectId, branchId]);

    // Fetch Progress
    useEffect(() => {
        const fetchProgress = async () => {
            if (!backendSubjectId) return;
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const classId = user.class || 10;

                const res = await API.get(`/progress/getSubjectProgress?classId=${classId}`);
                if (res.data) {
                    const prog = res.data.find(p => p.subjectId === backendSubjectId);
                    if (prog) {
                        setProgressData(prog);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch progress", e);
            }
        };
        fetchProgress();
    }, [backendSubjectId]);


    // Helper to get youtube ID 
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };


    const handleChapterClick = (chapterId) => {
        if (subjectId === 'maths') {
            navigate(`/video-learning/maths/${chapterId}`);
        } else if (subjectId === 'science' && branchId) {
            navigate(`/video-learning/science/${branchId}/${chapterId}`);
        }
    };

    return (
        <div className="py-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-slate-800">
                {branchId ? branchId.charAt(0).toUpperCase() + branchId.slice(1) : subjectId === 'maths' ? 'Mathematics' : ''} Chapters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter) => {
                    // Calculate Progress for this chapter
                    let completedCount = 0;
                    const totalVideos = chapter.videos?.length || 0;

                    if (progressData && progressData.videosCompleted && totalVideos > 0) {
                        completedCount = chapter.videos.reduce((acc, video) => {
                            const vidId = getYoutubeId(video.url);
                            if (vidId && progressData.videosCompleted.includes(vidId)) {
                                return acc + 1;
                            }
                            return acc;
                        }, 0);
                    }

                    const percent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
                    const isCompleted = totalVideos > 0 && percent === 100;

                    return (
                        <div
                            key={chapter.id}
                            onClick={() => handleChapterClick(chapter.id)}
                            className={`group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all border cursor-pointer flex flex-col justify-between h-full relative overflow-hidden ${isCompleted ? "border-green-200 dark:border-green-900/30" : "border-slate-200 dark:border-slate-700"}`}
                        >
                            {/* Progress Overlay (Subtle background fill optional, using bar instead for clarity) */}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`font-semibold text-lg transition-colors ${isCompleted ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white group-hover:text-blue-600"}`}>
                                        {chapter.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {totalVideos} Videos
                                    </p>
                                </div>
                                <div className={`transform transition-all duration-300 ${isCompleted ? "text-green-500" : "text-blue-500 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0"}`}>
                                    {isCompleted ? <CheckCircle size={24} /> : <PlayCircle size={24} />}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-auto">
                                <div className="flex justify-between text-xs mb-1.5 font-medium">
                                    <span className={isCompleted ? "text-green-600 dark:text-green-400" : "text-slate-400"}>
                                        {isCompleted ? "Completed" : `${percent}% Completed`}
                                    </span>
                                    <span className="text-slate-400">{completedCount}/{totalVideos}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-blue-600"}`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {chapters.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No chapters found for this section yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterList;
