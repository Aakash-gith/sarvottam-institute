import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/index.components";
import { Brain, History, Target, Clock, Mail, ChevronRight } from "lucide-react";

function Quiz() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 transition-all duration-300 overflow-auto">
        <div className="min-h-screen p-6 md:p-10">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
                <Brain size={40} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Brain Quiz Center</h1>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                Test your knowledge and track your learning progress with AI-powered quizzes
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

              {/* Create Quiz Card */}
              <div
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]"
                onClick={() => navigate("/quiz/create")}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                    📝
                  </div>
                  <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Create New Quiz</h2>
                <p className="text-gray-600 mb-6">
                  Start a personalized quiz on any topic with customizable questions and time limits
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
                  Start Quiz
                </button>
              </div>

              {/* Quiz History Card */}
              <div
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]"
                onClick={() => navigate("/quiz/history")}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                    📊
                  </div>
                  <ChevronRight size={24} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Quiz History</h2>
                <p className="text-gray-600 mb-6">
                  Review your past quiz attempts, scores, and track your learning progress over time
                </p>
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
                  View History
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Quiz Features</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personalized Questions */}
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Target size={28} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Personalized Questions</h3>
                  <p className="text-gray-600 text-sm">
                    AI-generated questions tailored to your chosen topic and difficulty level
                  </p>
                </div>

                {/* Timed Quizzes */}
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg hover:border-amber-200 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Clock size={28} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Timed Challenges</h3>
                  <p className="text-gray-600 text-sm">
                    Customizable time limits to simulate real exam conditions and improve speed
                  </p>
                </div>

                {/* Detailed Feedback */}
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Mail size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Detailed Explanations</h3>
                  <p className="text-gray-600 text-sm">
                    Get comprehensive explanations via email to understand concepts better
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">1</div>
                  <h3 className="text-gray-900 font-bold mb-2">Choose Topic</h3>
                  <p className="text-gray-600 text-sm">Enter any subject or topic you want to be quizzed on</p>
                </div>

                <div className="text-center group">
                  <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">2</div>
                  <h3 className="text-gray-900 font-bold mb-2">Set Parameters</h3>
                  <p className="text-gray-600 text-sm">Choose number of questions and time limit</p>
                </div>

                <div className="text-center group">
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">3</div>
                  <h3 className="text-gray-900 font-bold mb-2">Take Quiz</h3>
                  <p className="text-gray-600 text-sm">Answer questions within the time limit</p>
                </div>

                <div className="text-center group">
                  <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">4</div>
                  <h3 className="text-gray-900 font-bold mb-2">Get Results</h3>
                  <p className="text-gray-600 text-sm">View score and optionally receive detailed explanations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;