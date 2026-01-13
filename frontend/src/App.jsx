import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  logIn,
  signUp,
  verify,
  index,
  forgotPass,
  events,
  notes,
  subjectNotes,
  physicsChapters,
  notesChapter,
  notesViewer,
  pyq,
  quiz,
  quizCreate,
  quizTake,
  quizResults,
  quizHistory,
  profile,
  adminLogin,
  adminSignup,
  adminRequestStatus,
  adminForgotPassword,
  adminDashboard,
  adminUserAnalytics,
  importantQuestions,
  ncertSolutions,
  ncertExemplar,
  books,
  chat,
  videoLearning,
  videoLearningSubject,
  videoLearningContent,
  videoLearningChapter,
  videoWatchMaths,
  videoWatchScience,
  courses,
  myCourses,
  courseLearning,
  liveClassHost,
  notifications,
  supportTickets,
  privacyPolicy,
  termsOfService,
  refundPolicy,
  masteryHub,
  masterySet,
} from "./Routes/Routes";

import conf from "./conf/conf";

// Lazy load components
const Home = React.lazy(() => import("./pages/Home"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Events = React.lazy(() => import("./pages/Events"));
const Notes = React.lazy(() => import("./pages/Notes"));
const SubjectNotes = React.lazy(() => import("./pages/SubjectNotes"));
const NotesPage = React.lazy(() => import("./pages/NotesPage"));
const PYQ = React.lazy(() => import("./pages/PYQ"));
const Quiz = React.lazy(() => import("./pages/Quiz"));
const Profile = React.lazy(() => import("./pages/Profile"));
const ImportantQuestions = React.lazy(() => import("./pages/ImportantQuestions"));
const NcertSolutions = React.lazy(() => import("./pages/NcertSolutions"));
const NcertExemplar = React.lazy(() => import("./pages/NcertExemplar"));
const Books = React.lazy(() => import("./pages/Books"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const AdminLogin = React.lazy(() => import("./pages/Admin/AdminLogin"));
const AdminSignup = React.lazy(() => import("./pages/Admin/AdminSignup"));
const AdminRequestStatus = React.lazy(() => import("./pages/Admin/AdminRequestStatus"));
const AdminForgotPassword = React.lazy(() => import("./pages/Admin/AdminForgotPassword"));
const AdminDashboard = React.lazy(() => import("./pages/Admin/AdminDashboard"));
const UserAnalyticsPage = React.lazy(() => import("./pages/Admin/UserAnalyticsPage"));
const CreateQuiz = React.lazy(() => import("./components/quiz/CreateQuiz"));
const TakeQuiz = React.lazy(() => import("./components/quiz/TakeQuiz"));
const QuizResults = React.lazy(() => import("./components/quiz/QuizResults"));
const QuizHistory = React.lazy(() => import("./components/quiz/QuizHistory"));
const PhysicsChapters = React.lazy(() => import("./components/notes/PhysicsChapters"));
const NotesViewer = React.lazy(() => import("./components/notes/NotesViewer"));
const Chat = React.lazy(() => import("./pages/Chat"));
const VideoLearning = React.lazy(() => import("./pages/VideoLearning/VideoLearning"));
const VideoPlayerPage = React.lazy(() => import("./pages/VideoLearning/VideoPlayerPage"));
const Courses = React.lazy(() => import("./pages/Courses"));
const MyCourses = React.lazy(() => import("./pages/MyCourses"));
const CourseLearning = React.lazy(() => import("./pages/CourseLearning"));
const LiveClassHost = React.lazy(() => import("./pages/LiveClassHost"));
const SupportTickets = React.lazy(() => import("./pages/SupportTickets"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = React.lazy(() => import("./pages/RefundPolicy"));
const MasteryHub = React.lazy(() => import("./pages/MasteryHub"));
const MasterySetView = React.lazy(() => import("./pages/MasterySetView"));

import ProtectedRoute from "./components/ProtectedRoute";
import { Skeleton } from "./components/Skeleton"; // Use our new Skeleton component

import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setTheme } from "./store/themeSlice";

function App() {
  const mode = useSelector((state) => state.theme.mode);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  // Sync theme with user preference on mount/login
  useEffect(() => {
    if (userData?.theme && userData.theme !== mode) {
      dispatch(setTheme(userData.theme));
    }
  }, [userData]);

  useEffect(() => {
    const applyTheme = () => {
      if (mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    // Listen for system theme changes if mode is 'system'
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [mode]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={conf.toast}
      />
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="loader"></div>
            <p className="text-accent dark:text-primary font-bold text-lg animate-pulse tracking-wide">Loading Sarvottam...</p>
          </div>
        </div>
      }>
        {/* ... existing Routes ... */}
        <Routes>
          <Route path={index} element={<Home />} />
          <Route path={logIn} element={<Auth />} />
          <Route path={verify} element={<Auth />} />
          <Route path={forgotPass} element={<Auth />} />
          <Route path={signUp} element={<Auth />} />

          {/* Admin Routes */}
          <Route path={adminLogin} element={<AdminLogin />} />
          <Route path={adminSignup} element={<AdminSignup />} />
          <Route path={adminRequestStatus} element={<AdminRequestStatus />} />
          <Route path={adminForgotPassword} element={<AdminForgotPassword />} />
          <Route path={adminDashboard} element={<AdminDashboard />} />
          <Route path={adminUserAnalytics} element={<UserAnalyticsPage />} />

          {/* Protected Routes - Only accessible when logged in */}
          <Route path={chat} element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path={events} element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path={notes} element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path={subjectNotes} element={<ProtectedRoute><SubjectNotes /></ProtectedRoute>} />
          <Route path={physicsChapters} element={<ProtectedRoute><PhysicsChapters /></ProtectedRoute>} />
          <Route path={notesChapter} element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path={notesViewer} element={<ProtectedRoute><NotesViewer /></ProtectedRoute>} />
          <Route path={pyq} element={<ProtectedRoute><PYQ /></ProtectedRoute>} />
          <Route path={quiz} element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path={quizCreate} element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
          <Route path={quizTake} element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
          <Route path={quizResults} element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
          <Route path={quizHistory} element={<ProtectedRoute><QuizHistory /></ProtectedRoute>} />
          <Route path={profile} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path={notifications} element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path={supportTickets} element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
          <Route path={importantQuestions} element={<ProtectedRoute><ImportantQuestions /></ProtectedRoute>} />
          <Route path={ncertSolutions} element={<ProtectedRoute><NcertSolutions /></ProtectedRoute>} />
          <Route path={ncertExemplar} element={<ProtectedRoute><NcertExemplar /></ProtectedRoute>} />
          <Route path={books} element={<ProtectedRoute><Books /></ProtectedRoute>} />
          <Route path={videoLearning} element={<ProtectedRoute><VideoLearning /></ProtectedRoute>} />
          <Route path={videoLearningSubject} element={<ProtectedRoute><VideoLearning /></ProtectedRoute>} />
          <Route path={videoLearningContent} element={<ProtectedRoute><VideoLearning /></ProtectedRoute>} />
          <Route path={videoLearningChapter} element={<ProtectedRoute><VideoLearning /></ProtectedRoute>} />
          <Route path={videoWatchMaths} element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} />
          <Route path={videoWatchScience} element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} />
          <Route path={courses} element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path={myCourses} element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path={courseLearning} element={<ProtectedRoute><CourseLearning /></ProtectedRoute>} />
          <Route path={masteryHub} element={<ProtectedRoute><MasteryHub /></ProtectedRoute>} />
          <Route path={masterySet} element={<ProtectedRoute><MasterySetView /></ProtectedRoute>} />

          <Route path={privacyPolicy} element={<PrivacyPolicy />} />
          <Route path={termsOfService} element={<TermsOfService />} />
          <Route path={refundPolicy} element={<RefundPolicy />} />


          <Route path={liveClassHost} element={<ProtectedRoute><LiveClassHost /></ProtectedRoute>} />
        </Routes>
      </React.Suspense>
    </>
  );
}

export default App;
