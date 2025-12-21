import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveQuiz, submitAnswer, submitQuiz } from "../../api/quiz";
import { toast } from "react-hot-toast";
import Sidebar from "../Sidebar";
import { Clock, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

function TakeQuiz() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await getActiveQuiz(attemptId);
        setQuizData(response.data);
        setTimeLeft(response.data.remainingTime || response.data.timeLimit * 60);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load quiz:", error);
        toast.error("Failed to load quiz");
        navigate("/quiz");
      }
    };

    loadQuiz();
  }, [attemptId, navigate]);

  // Timer effect
  useEffect(() => {
    if (!quizData || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, timeLeft]);

  const handleAutoSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await submitQuiz(attemptId, answers);
      toast.success("Quiz submitted automatically due to time limit");
      navigate(`/quiz/results/${attemptId}`);
    } catch (error) {
      console.error("Auto-submit error:", error);
      toast.error("Error submitting quiz");
    }
  }, [attemptId, answers, navigate]);

  const handleSelectAnswer = async (selectedAnswer) => {
    const newAnswers = { ...answers };
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    try {
      await submitAnswer(attemptId, {
        questionIndex: currentQuestionIndex,
        selectedAnswer: selectedAnswer
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast.error("Failed to save answer");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!window.confirm("Are you sure you want to submit the quiz?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQuiz(attemptId, answers);
      toast.success("Quiz submitted successfully");
      navigate(`/quiz/results/${attemptId}`);
    } catch (error) {
      console.error("Submit quiz error:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600 font-medium">No questions available</p>
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

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 60;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-[120px]">
        <div className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{quizData.topic}</h1>
                <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {quizData.totalQuestions}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold ${isTimeWarning ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                <Clock size={24} />
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
            </div>

            {/* Quiz Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm font-medium">Progress</span>
                  <span className="text-gray-900 font-semibold">{Math.round(((currentQuestionIndex + 1) / quizData.totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quizData.totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {currentQuestion.questionText}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options && currentQuestion.options.map((option, index) => {
                  const optionText = typeof option === 'string' ? option : option.text;
                  const isSelected = answers[currentQuestionIndex] === optionText;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(optionText)}
                      className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 border-2 ${isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-500"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        {optionText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-xl font-medium transition-colors"
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>

                {/* Question Dots */}
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, quizData.totalQuestions) }).map((_, i) => {
                    const pageNum = Math.floor(currentQuestionIndex / 5);
                    const startIdx = pageNum * 5;
                    const qIndex = startIdx + i;

                    if (qIndex >= quizData.totalQuestions) return null;

                    return (
                      <button
                        key={qIndex}
                        onClick={() => setCurrentQuestionIndex(qIndex)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${currentQuestionIndex === qIndex
                          ? "bg-blue-600 text-white"
                          : answers[qIndex] !== undefined && answers[qIndex] !== null
                            ? "bg-green-100 text-green-700 border-2 border-green-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {qIndex + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === quizData.totalQuestions - 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="w-full mt-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;