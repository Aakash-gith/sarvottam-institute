import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StudentDashboard from "../components/StudentDashboard";
import {
  BookOpen,
  Brain,
  Zap,
  ArrowRight,
  CheckCircle,
  User,
  Video,
  FileText,
  Lock,
  Unlock,
  Star,
  Users,
  ShieldCheck,
  MessageCircle,
  Activity,
  Play
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";

// Teacher Assets
import teacher1 from "../assets/teachers/teacher1.jpg";
import teacher2 from "../assets/teachers/teacher2.jpg";

function Home() {
  const { status } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-500 font-poppins">
      <Helmet>
        <title>Home | Sarvottam Institute</title>
        <meta name="description" content="Sarvottam Institute - Premium Learning for Grades 9 & 10" />
      </Helmet>

      {status && <Sidebar />}

      {/* Persistent Theme Toggle */}
      <div className="fixed top-6 right-6 z-[100] flex items-center gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
          <ThemeToggle />
          {!status && (
            <>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button
                onClick={() => navigate("/auth/login")}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <User size={16} />
                <span>Login</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`flex-1 ${status ? 'pt-20 lg:pt-8 ml-0 lg:ml-[100px] w-full lg:w-[calc(100%-100px)]' : 'w-full'}`}>
        {status ? (
          <div className="px-4 lg:px-10 pb-12">
            <StudentDashboard />
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {/* 1. Hero Section */}
            <section className="relative pt-24 pb-20 px-4 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full"></div>
              </div>

              <div className="max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold mb-8 animate-bounce">
                  <Star size={14} fill="currentColor" />
                  <span>Nurturing Excellence for Grades 9 & 10</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
                  Master Your Future with <br />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sarvottam Institute</span>
                </h1>

                <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
                  The ultimate learning platform for Maths and Science. Get personalized support,
                  AI-powered assessments, and premium study materials curated by experts.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button
                    onClick={() => navigate("/auth/signup")}
                    className="group w-full sm:w-auto px-10 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 text-lg"
                  >
                    Start Learning Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate("/courses")}
                    className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
                  >
                    View Courses
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Top-Tier Mentors Section - Building Trust */}
            <section className="py-20 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Learn from the Best</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                    Our educators are not just teachers, they are experts committed to your success.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                  <TeacherCard
                    image={teacher1}
                    name="Aakash Ranjan"
                    subject="Mathematics Expert"
                    experience="10+ Years Experience"
                    specialization="Advanced Algebra & Geometry Specialist"
                  />
                  <TeacherCard
                    image={teacher2}
                    name="Ujjwal Ranjan"
                    subject="Science Specialist"
                    experience="8+ Years Experience"
                    specialization="Expert in Physics & Chemistry Fundamentals"
                  />
                </div>
              </div>
            </section>

            {/* 3. Key Platform Features Section */}
            <section className="py-24 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Powerful Features</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">Tools designed to accelerate your academic growth.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FeatureCard
                    icon={Video}
                    title="Live Interactive Classes"
                    desc="Real-time two-way interaction with teachers to clear doubts instantly."
                    color="bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                  />
                  <FeatureCard
                    icon={FileText}
                    title="Structured Study Notes"
                    desc="High-quality, curriculum-aligned HTML notes accessible on any device."
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                  />
                  <FeatureCard
                    icon={Brain}
                    title="Tests & AI Quizzes"
                    desc="Personalized assessments driven by advanced AI to track your performance."
                    color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                  />
                  <FeatureCard
                    icon={Activity}
                    title="Progress Tracking"
                    desc="Detailed analytics heatmaps to visualize your learning journey."
                    color="bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                  />
                  <FeatureCard
                    icon={MessageCircle}
                    title="24/7 Doubt Support"
                    desc="Dedicated chat channels for instant resolution of academic queries."
                    color="bg-pink-100 text-pink-600 dark:bg-pink-900/30"
                  />
                  <FeatureCard
                    icon={ShieldCheck}
                    title="Board Prep Specialist"
                    desc="Curated content designed specifically for scoring high in board exams."
                    color="bg-sky-100 text-sky-600 dark:bg-sky-900/30"
                  />
                </div>
              </div>
            </section>

            {/* 4. Freemium Content Section (Free vs Locked) */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-black mb-4">Start for Free, Master the Rest</h2>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">Get a taste of premium education before you commit to the full journey.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* Free Content Column */}
                  <div>
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <Unlock className="text-emerald-400" /> Free Resources
                    </h3>
                    <div className="space-y-4">
                      <ResourceItem icon={Play} title="Intro to Polynomials (Video Demo)" type="Video" isLocked={false} />
                      <ResourceItem icon={FileText} title="Class 10 Science Sample Notes" type="Notes" isLocked={false} />
                      <ResourceItem icon={Zap} title="Foundation Level Math Quiz" type="Quiz" isLocked={false} />
                    </div>
                  </div>

                  {/* Locked Content Column */}
                  <div>
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <Lock className="text-red-400" /> Premium Content
                    </h3>
                    <div className="space-y-4 relative">
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center">
                        <button
                          onClick={() => navigate("/auth/signup")}
                          className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-2xl hover:scale-105 transition-transform"
                        >
                          Unlock Full Access
                        </button>
                      </div>
                      <ResourceItem icon={Video} title="Complete Trigonometry Mastery" type="Video" isLocked={true} />
                      <ResourceItem icon={ShieldCheck} title="Physics Board Predictor Papers" type="Prep" isLocked={true} />
                      <ResourceItem icon={Users} title="Live Mentorship & Doubt Sessions" type="Live" isLocked={true} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Registration CTA Section */}
            <section className="py-24 px-4">
              <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary via-indigo-600 to-accent rounded-[32px] p-8 md:p-16 text-center text-white shadow-[0_32px_64px_-16px_rgba(37,99,235,0.3)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 p-32 bg-accent/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                  <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight animate__animated animate__pulse animate__infinite">Register to Unlock <br className="hidden md:block" /> All Premium Content</h2>
                  <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
                    Join over 5,000+ students already mastering their board exams with Sarvottam Institute.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                      onClick={() => navigate("/auth/signup")}
                      className="px-10 py-5 bg-white text-primary font-black rounded-2xl hover:shadow-2xl transition-all shadow-xl text-lg hover:-translate-y-1"
                    >
                      Get Full Access for Free
                    </button>
                    <button
                      onClick={() => navigate("/auth/login")}
                      className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/30 hover:bg-white/20 transition-all text-lg"
                    >
                      Login to Existing Account
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Helper Components
const TeacherCard = ({ image, name, subject, experience, specialization }) => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group overflow-hidden">
    <div className="flex flex-col sm:flex-row gap-6 items-center">
      <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500 ring-4 ring-slate-50 dark:ring-slate-700">
        <img src={image} alt={name} className="w-full h-full object-cover object-top scale-110 group-hover:scale-100 transition-transform duration-500" />
      </div>
      <div className="text-center sm:text-left">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{name}</h3>
        <p className="text-primary dark:text-primary-light font-bold text-sm mb-3 uppercase tracking-wider">{subject}</p>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">{experience}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium line-clamp-2 italic">
          "{specialization}"
        </p>
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
  <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
      {desc}
    </p>
  </div>
);

const ResourceItem = ({ icon: Icon, title, type, isLocked }) => (
  <div className={`p-4 rounded-2xl flex items-center justify-between transition-all group border ${isLocked ? 'border-slate-800 bg-slate-900/30' : 'bg-slate-800/50 border-slate-700 hover:border-primary'}`}>
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${isLocked ? 'bg-slate-800 text-slate-500' : 'bg-primary/20 text-primary'}`}>
        <Icon size={18} />
      </div>
      <div>
        <h4 className={`font-bold text-sm ${isLocked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{title}</h4>
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{type}</span>
      </div>
    </div>
    {isLocked ? <Lock size={16} className="text-slate-600" /> : <Unlock size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
  </div>
);

export default Home;