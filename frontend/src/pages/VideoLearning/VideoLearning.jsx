import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { videoLearningData } from "../../videoLearningData";
import SubjectSelection from "../../components/VideoLearning/SubjectSelection";
import BranchSelection from "../../components/VideoLearning/BranchSelection";
import ChapterList from "../../components/VideoLearning/ChapterList";
import VideoList from "../../components/VideoLearning/VideoList";
import { ArrowLeft, Home } from "lucide-react";

const VideoLearning = () => {
    const { subjectId, contentId, branchId, chapterId } = useParams();
    // Routes:
    // /video-learning/:subjectId/:contentId  (contentId is 'real-numbers' OR 'physics')
    // /video-learning/:subjectId/:branchId/:chapterId (branchId is 'physics', chapterId is 'motion')

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    // Helper to determine what to render
    const renderContent = () => {
        // 1. Root: Select Subject
        if (!subjectId) {
            return <SubjectSelection />;
        }

        const subjectData = videoLearningData.class10[subjectId];

        if (!subjectData) {
            return <div>Subject not found</div>;
        }

        // 2. Subject Selected (No intermediate content or branch/chapter)
        if (!contentId && !branchId) {
            // If Maths -> Show Chapters directly
            if (subjectId === "maths") {
                return <ChapterList chapters={subjectData} subjectId={subjectId} />;
            }
            // If Science -> Show Branches
            if (subjectId === "science") {
                return <BranchSelection />;
            }
            return <div>Invalid Subject</div>;
        }

        // 3. Content Selected (Branch for Science, or Chapter for Maths)
        // Only contentId is present (route: /:subjectId/:contentId)
        if (contentId && !chapterId) {
            // If Maths, contentId is the chapter slug/id
            if (subjectId === "maths") {
                const chapter = subjectData.find(c => c.id === contentId);
                if (!chapter) return <div>Chapter not found</div>;
                return <VideoList chapter={chapter} />;
            }

            if (subjectId === "science") {
                // contentId is the branch (physics/chemistry/biology)
                const branchData = subjectData[contentId];
                if (!branchData) return <div>Branch not found</div>;
                return <ChapterList chapters={branchData} subjectId={subjectId} branchId={contentId} />;
            }
        }

        // 4. Chapter Selected (For Science: /science/physics/motion)
        // route: /:subjectId/:branchId/:chapterId
        if (chapterId && branchId) {
            if (subjectId === "science") {
                const branchData = subjectData[branchId];
                if (!branchData) return <div>Branch not found</div>;
                const chapter = branchData.find(c => c.id === chapterId);
                if (!chapter) return <div>Chapter not found</div>;
                return <VideoList chapter={chapter} />;
            }
        }

        return <div>Page not found</div>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            {/* Header / Breadcrumb-ish */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {(subjectId || contentId) && (
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer hover:scale-110 active:scale-95"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Video Learning
                        </h1>
                        {/* Add Breadcrumbs based on params later if needed */}
                    </div>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 cursor-pointer hover:scale-110 active:scale-95"
                    title="Go to Dashboard"
                >
                    <Home size={24} />
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderContent()}
            </div>
        </div>
    );
};

export default VideoLearning;
