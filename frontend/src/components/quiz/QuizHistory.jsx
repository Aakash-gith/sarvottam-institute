import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizHistory, deleteQuizAttempt } from "../../api/quiz";
import { toast } from "react-hot-toast";
import Sidebar from "../Sidebar";
import { Trash2, X, History, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, XCircle, Calendar, Play } from "lucide-react";

function QuizHistory() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, attemptId: null, topic: "" });
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getQuizHistory();
        setHistory(response.data.attempts || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error("Failed to load quiz history");
        navigate("/quiz");
      }
    };

    loadHistory();
  }, [navigate]);

  const getGrade = (score) => {
    if (score >= 90) return { letter: "A+", bg: "bg-green-100", text: "text-green-700" };
    if (score >= 80) return { letter: "A", bg: "bg-green-100", text: "text-green-700" };
    if (score >= 70) return { letter: "B", bg: "bg-blue-100", text: "text-blue-700" };
    if (score >= 60) return { letter: "C", bg: "bg-yellow-100", text: "text-yellow-700" };
    if (score >= 50) return { letter: "D", bg: "bg-orange-100", text: "text-orange-700" };
    return { letter: "F", bg: "bg-red-100", text: "text-red-700" };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading history...</span>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedHistory = history.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDeleteClick = (e, attemptId, topic) => {
    e.stopPropagation();
    setDeleteModal({ show: true, attemptId, topic });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.attemptId) return;

    setDeleting(true);
    try {
      await deleteQuizAttempt(deleteModal.attemptId);
      setHistory(history.filter(h => h._id !== deleteModal.attemptId));
      toast.success("Quiz deleted successfully");
      setDeleteModal({ show: false, attemptId: null, topic: "" });
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast.error("Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, attemptId: null, topic: "" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 overflow-auto ml-[120px]">
        <div className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">

            {/* Back Button */}
            <button
              onClick={() => navigate("/quiz")}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Quiz Center
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
                <History size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz History</h1>
              <p className="text-gray-600">Review your past quiz attempts</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">

              {history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600 text-lg mb-6">No quiz attempts yet</p>
                  <button
                    onClick={() => navigate("/quiz/create")}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md"
                  >
                    <Play size={18} />
                    Take Your First Quiz
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    {displayedHistory.map((attempt, index) => {
                      const grade = getGrade(attempt.score);
                      return (
                        <div
                          key={attempt._id || index}
                          className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer relative group"
                          onClick={() => navigate(`/quiz/results/${attempt._id}`)}
                        >
                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteClick(e, attempt._id, attempt.topic)}
                            className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Delete Quiz"
                          >
                            <Trash2 size={18} />
                          </button>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">{attempt.topic}</h3>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <span className="font-medium text-gray-700">{attempt.totalQuestions}</span> questions
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(attempt.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Score Circle */}
                              <div className="text-center">
                                <div className="relative w-20 h-20">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke="#e5e7eb"
                                      strokeWidth="6"
                                    />
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke="#3B82F6"
                                      strokeWidth="6"
                                      strokeDasharray={`${(attempt.score / 100) * 251} 251`}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-gray-900">{attempt.score}</span>
                                  </div>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Accuracy</p>
                              </div>

                              {/* Grade Badge */}
                              <div className={`px-5 py-3 rounded-xl font-bold text-lg ${grade.bg} ${grade.text}`}>
                                {grade.letter}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle size={16} className="text-green-600" />
                              <span className="text-gray-600">Correct:</span>
                              <span className="font-semibold text-green-600">{attempt.correctAnswers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <XCircle size={16} className="text-red-500" />
                              <span className="text-gray-600">Incorrect:</span>
                              <span className="font-semibold text-red-500">{attempt.incorrectAnswers}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-8 border-t border-gray-200">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={18} />
                        Previous
                      </button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => {
                          const page = i + 1;
                          const isVisible = Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;

                          if (!isVisible && page !== currentPage + 3 && page !== currentPage - 3) {
                            return null;
                          }

                          if (!isVisible) {
                            return (
                              <span key={page} className="text-gray-400 px-2">
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
                      >
                        Next
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  <div className="text-center mt-6 text-gray-500 text-sm">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, history.length)} of {history.length} quizzes
                  </div>
                </>
              )}
            </div>

            {/* Action Button */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/quiz/create")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Play size={18} />
                Take a New Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Delete Quiz</h3>
                <button
                  onClick={handleDeleteCancel}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 mb-2">Are you sure you want to delete this quiz?</p>
              <p className="text-red-600 font-medium mb-4 bg-red-50 px-3 py-2 rounded-lg">"{deleteModal.topic}"</p>

              <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The quiz and all its results will be permanently removed.</p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizHistory;