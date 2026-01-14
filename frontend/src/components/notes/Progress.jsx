import React, { useMemo, useState, useEffect } from "react";
import { classData, fetchClassProgress } from "../../classData";
import { TrendingUp, BookOpen, Video, Target } from "lucide-react";

function Progress() {
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentClass = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        return userData.class || 9;
      } catch (error) {
        console.error("Error reading localStorage:", error);
        return 9;
      }
    }
    return 9;
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      try {
        const data = await fetchClassProgress(currentClass);
        if (data) {
          setCompletion(data.completion || 0);
        } else {
          setCompletion(0);
        }
      } catch (error) {
        console.error("Failed to load progress:", error);
        setCompletion(0);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [currentClass]);

  const classInfo = classData[currentClass];

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Loading progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-6">
        {/* Left Side - Title and Progress */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Target size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Class {currentClass === 9 ? "IX" : "X"} Progress
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                {classInfo?.subjects?.length || 0} subjects • Track your learning journey
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-green-600" />
                <span className="text-gray-700 dark:text-slate-200 font-medium">Overall Completion</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{completion}%</span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
              Progress includes notes read and video lectures watched.
            </p>
          </div>
        </div>

        {/* Right Side - Quick Stats */}
        <div className="flex gap-4 flex-shrink-0 self-stretch">
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl px-6 py-4 text-center border border-blue-100 dark:border-blue-900/20 flex flex-col items-center justify-center min-w-[120px]">
            <BookOpen size={24} className="text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Notes Read</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl px-6 py-4 text-center border border-red-100 dark:border-red-900/20 flex flex-col items-center justify-center min-w-[120px]">
            <Video size={24} className="text-red-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Videos Watched</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;
