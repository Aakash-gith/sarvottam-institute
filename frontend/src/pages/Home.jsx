import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Dashboard, Calendar, CreateEvent } from "../components/index.components";
import GradeCard from "../components/GradeCard";
import { BookOpen, Brain, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

function Home() {
  const { status } = useSelector((state) => state.auth);
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshEvents, setRefreshEvents] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);
    setRefreshEvents((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Helmet>
        <title>Home | Sarvottam Institute</title>
        <meta name="description" content="Sarvottam Institute - Excellence in Education for Grades 9 & 10" />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          {status ? (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome back, <span className="text-[#d8fbff]">{userData?.name?.split(" ")[0]}</span>! 👋
              </h1>
              <p className="text-blue-50 text-lg">
                Continue your learning journey in Grade {userData?.class === 9 ? "9" : "10"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Learn, Practice, Excel in <span className="text-[#d8fbff]">Grades 9 & 10</span>
              </h1>
              <p className="text-blue-50 text-lg mb-8">
                Focused study materials, practice questions, and resources for Maths and Science.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigate("/auth/signup")}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/auth/login")}
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
                >
                  Login
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-6">Join thousands of students excelling in Maths and Science</p>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1">
        {status ? (
          <>
            {/* For Logged In Users - Dashboard and Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <Dashboard />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto max-h-96">
                <Calendar refresh={refreshEvents} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* For Non-Logged In Users */}
            {/* Explore Subjects Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore Subjects</h2>
              <p className="text-gray-600 mb-8">
                Focused learning resources for Mathematics and Science for grades 9 and 10
              </p>
              <div className="inline-block bg-blue-50 rounded-lg p-8 w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-blue-200">
                    <div className="text-4xl mb-3">🔢</div>
                    <h3 className="text-lg font-semibold text-gray-900">Mathematics</h3>
                    <p className="text-gray-600 text-sm mt-2">Algebra, Geometry, Statistics and more</p>
                  </div>
                  <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-blue-200">
                    <div className="text-4xl mb-3">🧪</div>
                    <h3 className="text-lg font-semibold text-gray-900">Science</h3>
                    <p className="text-gray-600 text-sm mt-2">Physics, Chemistry, Biology and more</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <GradeCard
                icon="📖"
                title="Grade 9"
                description="Access comprehensive Maths and Science study materials, practice questions, and resources for 9th grade curriculum."
                features={[
                  "Complete study materials",
                  "Practice questions",
                  "Progress tracking",
                ]}
                buttonText="Explore Grade 9"
                onButtonClick={() => navigate("/auth/signup")}
              />

              <GradeCard
                icon="🎓"
                title="Grade 10"
                description="Prepare for board exams with our extensive Maths and Science resources for 10th grade students."
                features={[
                  "Board exam preparation",
                  "Mock tests",
                  "Expert solutions",
                ]}
                buttonText="Explore Grade 10"
                onButtonClick={() => navigate("/auth/signup")}
              />
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-3">Ready to Start Learning?</h2>
              <p className="mb-6 text-blue-100">Join thousands of students already using Sarvottam Institute</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigate("/auth/signup")}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  Sign Up Now
                </button>
                <button
                  onClick={() => navigate("/auth/login")}
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
                >
                  Login
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateEvent open={isModalOpen} onClose={handleClose} />
    </div>
  );
}

export default Home;