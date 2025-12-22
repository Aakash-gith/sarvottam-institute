import React from "react";
import { Play, Clock, ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";

const VideoList = ({ chapter }) => {
    const { subjectId, branchId, contentId } = useParams();

    // Helper to extract YouTube ID from standard URL
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleVideoClick = (video) => {
        const videoId = getYoutubeId(video.url);
        if (!videoId) return;

        let path = "";

        if (subjectId === "maths") {
            // Maths route: /video-learning/watch/maths/:chapterId/:videoId
            // Here chapter.id is the chapterId (passed as prop)
            path = `/video-learning/watch/maths/${chapter.id}/${videoId}`;
        } else if (subjectId === "science") {
            // Science route: /video-learning/watch/science/:branchId/:chapterId/:videoId
            // We need branchId. In the route /video-learning/science/:branchId/:chapterId, 
            // the param might be named 'branchId' (from /:subjectId/:branchId/:chapterId)
            // OR 'contentId' if it was the intermediate step? 
            // In VideoLearning.jsx, for Science, we render VideoList only when params are /:subjectId/:branchId/:chapterId (or similar logic).
            // Let's rely on branchId param from context if available, otherwise check contentId.

            const branch = branchId || contentId; // fallback if loosely matched
            path = `/video-learning/watch/science/${branch}/${chapter.id}/${videoId}`;
        }

        if (path) {
            window.open(path, "_blank");
        }
    };

    return (
        <div className="py-6">
            <h2 className="text-2xl font-bold mb-2 dark:text-white text-slate-800">{chapter.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Video Lectures</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapter.videos.map((video, idx) => {
                    const videoId = getYoutubeId(video.url);
                    const thumbnailUrl = videoId
                        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                        : null;

                    return (
                        <div
                            key={idx}
                            onClick={() => handleVideoClick(video)}
                            className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 cursor-pointer flex flex-col h-full relative"
                            title="Open in new tab"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-black/5 dark:bg-black/20 overflow-hidden">
                                <img
                                    src={thumbnailUrl || "https://img.youtube.com/vi/yGLH--JOjEA/mqdefault.jpg"}
                                    alt={video.title}
                                    className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ${!thumbnailUrl ? "opacity-80 grayscale-[0.2]" : ""}`}
                                />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                                        <Play size={24} fill="currentColor" />
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink size={14} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                    {video.title}
                                </h3>
                                {video.description && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-grow">
                                        {video.description}
                                    </p>
                                )}
                                <div className="flex items-center text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <Clock size={14} className="mr-1" />
                                    {video.duration || "Video"}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VideoList;
