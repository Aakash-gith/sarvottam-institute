import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizResults, sendExplanationEmail } from "../../api/quiz";
import { toast } from "react-hot-toast";
import Sidebar from "../Sidebar";
import { Mail, CheckCircle, XCircle, ArrowRight, RotateCcw, History } from "lucide-react";

function QuizResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [shouldSendEmail, setShouldSendEmail] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await getQuizResults(attemptId);
        setResults(response.data);
        setEmailSent(response.data.explanationEmailSent || false);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load results:", error);
        toast.error("Failed to load quiz results");
        navigate("/quiz");
      }
    };

    loadResults();
  }, [attemptId, navigate]);

  const getGrade = (score) => {
    if (score >= 90) return { letter: "A+", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 80) return { letter: "A", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 70) return { letter: "B", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 60) return { letter: "C", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (score >= 50) return { letter: "D", color: "text-orange-600", bg: "bg-orange-100" };
    return { letter: "F", color: "text-red-600", bg: "bg-red-100" };
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Outstanding! You have excellent knowledge on this topic.";
    if (score >= 80) return "Great job! You have a strong understanding.";
    if (score >= 70) return "Good work! You have solid knowledge.";
    if (score >= 60) return "Not bad! Keep practicing to improve.";
    if (score >= 50) return "Keep studying! Focus on weak areas.";
    return "Need more practice! Review the material carefully.";
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await sendExplanationEmail(attemptId, { shouldSendEmail: true });
      toast.success("Explanation email sent successfully!");
      setEmailSent(true);
      setShouldSendEmail(false);
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading results...</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 font-medium">No results available</p>
          <button
            onClick={() => navigate("/quiz")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const grade = getGrade(results.score);
  const performanceMessage = getPerformanceMessage(results.score);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 overflow-auto ml-0 md:ml-[120px]">
        <div className="min-h-screen pt-20 md:pt-10 p-4 md:p-6">
          <div className="max-w-2xl mx-auto">

            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
              <p className="text-gray-600 text-sm md:text-base">{results.topic}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-200 mb-6">

              {/* Score Circle */}
              <div className="text-center mb-8">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="8"
                      strokeDasharray={`${(results.score / 100) * 283} 283`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">{results.score}</span>
                    <span className="text-gray-500 text-sm md:text-base">%</span>
                  </div>
                </div>

                <div className={`inline-block px-6 py-2 rounded-xl font-bold text-2xl ${grade.color} ${grade.bg} mb-3`}>
                  {grade.letter}
                </div>
                <p className="text-gray-600 text-lg">{performanceMessage}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                <div className="bg-gray-50 p-3 md:p-4 rounded-xl text-center border border-gray-100">
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{results.totalQuestions}</div>
                  <div className="text-gray-500 text-[10px] md:text-sm">Total</div>
                </div>
                <div className="bg-green-50 p-3 md:p-4 rounded-xl text-center border border-green-100">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle size={16} className="text-green-600 md:w-5 md:h-5" />
                    <span className="text-xl md:text-2xl font-bold text-green-600">{results.correctAnswers}</span>
                  </div>
                  <div className="text-gray-500 text-[10px] md:text-sm">Correct</div>
                </div>
                <div className="bg-red-50 p-3 md:p-4 rounded-xl text-center border border-red-100">
                  <div className="flex items-center justify-center gap-1">
                    <XCircle size={16} className="text-red-500 md:w-5 md:h-5" />
                    <span className="text-xl md:text-2xl font-bold text-red-500">{results.incorrectAnswers}</span>
                  </div>
                  <div className="text-gray-500 text-[10px] md:text-sm">Incorrect</div>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Accuracy</span>
                  <span className="text-gray-900 font-bold">{results.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-green-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${results.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Email Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="emailCheckbox"
                    checked={shouldSendEmail}
                    onChange={(e) => setShouldSendEmail(e.target.checked)}
                    disabled={emailSent || sendingEmail}
                    className="w-5 h-5 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="emailCheckbox" className="text-gray-700 cursor-pointer">
                    Send me detailed explanations and answer sheet via email
                  </label>
                </div>

                {emailSent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <p className="text-green-700 text-sm">Email sent successfully to your registered email address.</p>
                  </div>
                )}

                <button
                  onClick={handleSendEmail}
                  disabled={emailSent || !shouldSendEmail || sendingEmail}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  <Mail size={20} />
                  {sendingEmail ? "Sending..." : emailSent ? "Email Already Sent" : "Send Explanations"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/quiz/create")}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all border border-gray-200 hover:border-blue-300"
              >
                <RotateCcw size={18} />
                Take Another Quiz
              </button>
              <button
                onClick={() => navigate("/quiz/history")}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all border border-gray-200 hover:border-blue-300"
              >
                <History size={18} />
                View History
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 mx-auto"
              >
                Back to Dashboard
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizResults;