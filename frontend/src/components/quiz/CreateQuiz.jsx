import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../api/quiz";
import { toast } from "react-hot-toast";
import Sidebar from "../Sidebar";
import { Play, Clock, HelpCircle, ArrowLeft, Sparkles } from "lucide-react";

function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    numberOfQuestions: 10,
    timeLimit: 30
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "numberOfQuestions" || name === "timeLimit"
        ? parseInt(value) || ""
        : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required";
    } else if (formData.topic.trim().length < 3) {
      newErrors.topic = "Topic must be at least 3 characters";
    }

    if (!formData.numberOfQuestions || formData.numberOfQuestions < 1) {
      newErrors.numberOfQuestions = "Number of questions must be at least 1";
    } else if (formData.numberOfQuestions > 50) {
      newErrors.numberOfQuestions = "Maximum 50 questions allowed";
    }

    if (!formData.timeLimit || formData.timeLimit < 1) {
      newErrors.timeLimit = "Time limit must be at least 1 minute";
    } else if (formData.timeLimit > 180) {
      newErrors.timeLimit = "Maximum time limit is 180 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await createQuiz(formData);
      toast.success("Quiz created successfully!");
      navigate(`/quiz/attempt/${response.data.attemptId}`);
    } catch (error) {
      console.error("Create quiz error:", error);
      toast.error(error.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const suggestedTopics = [
    "Number System", "Polynomials", "Motion", "Force and Laws",
    "Atoms and Molecules", "Cell Structure", "Coordinate Geometry",
    "Triangles", "Work and Energy", "Gravitation"
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 overflow-auto ml-0 md:ml-[120px]">
        <div className="min-h-screen pt-20 md:pt-10 p-4 md:p-6">
          <div className="max-w-2xl mx-auto">

            {/* Back Button */}
            <button
              onClick={() => navigate("/quiz")}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Quiz Center
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
                <Sparkles size={28} className="text-white md:hidden" />
                <Sparkles size={32} className="text-white hidden md:block" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create New Quiz</h1>
              <p className="text-gray-600 text-sm md:text-base">Test your knowledge with a personalized quiz</p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Topic Input */}
                <div>
                  <label htmlFor="topic" className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                    <HelpCircle size={18} className="text-blue-600" />
                    Quiz Topic
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="Enter the topic..."
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 border-2 ${errors.topic ? "border-red-400" : "border-gray-200"
                      } focus:border-blue-500 focus:outline-none transition-colors`}
                  />
                  {errors.topic && (
                    <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
                  )}

                  <div className="mt-3">
                    <p className="text-gray-500 text-sm mb-2">Suggested topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTopics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, topic }))}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${formData.topic === topic
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label htmlFor="numberOfQuestions" className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">#</span>
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    id="numberOfQuestions"
                    name="numberOfQuestions"
                    value={formData.numberOfQuestions}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 border-2 ${errors.numberOfQuestions ? "border-red-400" : "border-gray-200"
                      } focus:border-blue-500 focus:outline-none transition-colors`}
                  />
                  {errors.numberOfQuestions && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfQuestions}</p>
                  )}

                  <div className="mt-3 flex gap-2">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, numberOfQuestions: num }))}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${formData.numberOfQuestions === num
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label htmlFor="timeLimit" className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                    <Clock size={18} className="text-blue-600" />
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    min="1"
                    max="180"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-900 border-2 ${errors.timeLimit ? "border-red-400" : "border-gray-200"
                      } focus:border-blue-500 focus:outline-none transition-colors`}
                  />
                  {errors.timeLimit && (
                    <p className="text-red-500 text-sm mt-1">{errors.timeLimit}</p>
                  )}

                  <div className="mt-3 flex gap-2">
                    {[15, 30, 45, 60].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, timeLimit: time }))}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${formData.timeLimit === time
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {time}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h3 className="text-gray-900 font-bold mb-3">Quiz Preview</h3>
                  <div className="text-gray-600 space-y-2">
                    <p><span className="font-medium text-gray-700">Topic:</span> {formData.topic || "Not specified"}</p>
                    <p><span className="font-medium text-gray-700">Questions:</span> {formData.numberOfQuestions || 0}</p>
                    <p><span className="font-medium text-gray-700">Duration:</span> {formData.timeLimit || 0} minutes</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.topic.trim() || !formData.numberOfQuestions || !formData.timeLimit}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Play size={20} />
                    {loading ? "Creating Quiz..." : "Start Quiz"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;