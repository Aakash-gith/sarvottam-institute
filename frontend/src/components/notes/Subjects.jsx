import React, { useMemo, useState, useEffect } from "react";
import {
  classData,
  fetchSubjectProgress,
  initClassProgress,
} from "../../classData";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Video, ChevronRight, TrendingUp, ArrowLeft } from "lucide-react";

function Subjects() {
  const [subjectsProgress, setSubjectsProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const studentId = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        return userData.id;
      } catch (error) {
        console.error("Error reading localStorage:", error);
        return null;
      }
    }
    return null;
  }, []);

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

  // Handle back navigation from sub-subjects
  useEffect(() => {
    if (location.state?.selectedSubjectId) {
      const subjects = classData[currentClass]?.subjects || [];
      const subjectToSelect = subjects.find(s => s.id === location.state.selectedSubjectId);
      if (subjectToSelect) {
        setSelectedSubject(subjectToSelect);
        // Clear state to prevent stuck navigation
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, currentClass]);

  useEffect(() => {
    const loadSubjectProgress = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchSubjectProgress(currentClass);
        setSubjectsProgress(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching progress:", error);
        setSubjectsProgress([]);
      }
      setLoading(false);
    };

    loadSubjectProgress();
  }, [studentId, currentClass]);

  useEffect(() => {
    const semSubjects = classData[currentClass]?.subjects || [];
    initClassProgress(currentClass, semSubjects);
  }, [currentClass]);

  const subjects = classData[currentClass]?.subjects || [];

  const subjectsWithProgress = subjects.map((subject) => {
    let notesCompleted = 0;
    let lecturesCompleted = 0;
    let totalNotes = 0;
    let totalLectures = 0;
    let completion = 0;

    if (subject.hasSubSubjects && subject.subSubjects) {
      // For Science: sum notes and progress from all sub-subjects
      subject.subSubjects.forEach((ss) => {
        totalNotes += ss.notes?.length || 0;
        // Add video counts if available in structure in future

        const ssProgress = subjectsProgress.find((p) => p.subjectId === ss.id);
        if (ssProgress) {
          notesCompleted += ssProgress.notesCompleted?.length || 0;
          lecturesCompleted += ssProgress.videosCompleted?.length || 0;
        }
      });

      const totalItems = totalNotes + totalLectures;
      if (totalItems > 0) {
        completion = Math.round(((notesCompleted + lecturesCompleted) / totalItems) * 100);
      }
    } else {
      // For regular subjects like Maths
      const progressData = subjectsProgress.find(
        (p) => p.subjectId === subject.id
      );

      totalNotes = subject.notes?.length || 0;

      if (progressData) {
        notesCompleted = progressData.notesCompleted?.length || 0;
        lecturesCompleted = progressData.videosCompleted?.length || 0;
        completion = progressData.completion ?? 0;
      }
    }

    return {
      ...subject,
      lecturesCompleted,
      notesCompleted,
      totalNotes,
      totalLectures,
      completion,
    };
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Loading subjects...</span>
        </div>
      </div>
    );
  }

  const getSubSubjectColor = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      green: "from-green-500 to-green-600",
    };
    return colors[color] || colors.blue;
  };

  const getSubSubjectBgColor = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 hover:border-blue-400",
      purple: "bg-purple-50 border-purple-200 hover:border-purple-400",
      green: "bg-green-50 border-green-200 hover:border-green-400",
    };
    return colors[color] || colors.blue;
  };

  // If a subject with sub-subjects is selected, show sub-subjects view
  if (selectedSubject && selectedSubject.hasSubSubjects) {
    return (
      <div className="bg-white rounded-xl p-6 md:p-8">
        <div className="mb-6">
          <button
            onClick={() => setSelectedSubject(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Subjects</span>
          </button>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
            {selectedSubject.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Select a branch to view notes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedSubject.subSubjects.map((subSubject) => (
            <div
              key={subSubject.id}
              onClick={() => navigate(`/notes/${subSubject.id}`)}
              className={`rounded-xl p-6 border-2 ${getSubSubjectBgColor(subSubject.color)} hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]`}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getSubSubjectColor(subSubject.color)} flex items-center justify-center text-3xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 mb-4`}>
                {subSubject.icon}
              </div>
              <h4 className="text-gray-900 font-bold text-lg group-hover:text-blue-600 transition-colors">
                {subSubject.name}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {subSubject.notes?.length || 0} Chapters available
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-600 group-hover:text-blue-600">
                <span>View Notes</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">
          Your Subjects
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Class {currentClass === 9 ? "IX" : "X"} - Track your learning progress
        </p>
      </div>

      <div className="space-y-4">
        {subjectsWithProgress.length > 0 ? (
          subjectsWithProgress.map((subject) => (
            <div
              key={subject.id}
              onClick={() => {
                if (subject.hasSubSubjects) {
                  setSelectedSubject(subject);
                } else {
                  navigate(`/notes/${subject.id}`);
                }
              }}
              className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-400 hover:shadow-lg hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Subject Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  {subject.icon}
                </div>

                {/* Subject Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-900 font-bold text-lg group-hover:text-blue-600 transition-colors">
                      {subject.name}
                    </h4>
                    <ChevronRight
                      size={20}
                      className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {subject.description}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4 mb-4 ml-[72px]">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg">
                  <Video size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    {subject.totalLectures} Lecture{subject.totalLectures !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-lg">
                  <BookOpen size={14} className="text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    {subject.totalNotes} Note{subject.totalNotes !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="ml-[72px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">Progress</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {subject.completion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${subject.completion}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 font-medium">No subjects available yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon for your class materials</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subjects;
