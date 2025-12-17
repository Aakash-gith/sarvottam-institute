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
const AdminLogin = React.lazy(() => import("./pages/Admin/AdminLogin"));
const AdminSignup = React.lazy(() => import("./pages/Admin/AdminSignup"));
const AdminRequestStatus = React.lazy(() => import("./pages/Admin/AdminRequestStatus"));
const AdminForgotPassword = React.lazy(() => import("./pages/Admin/AdminForgotPassword"));
const AdminDashboard = React.lazy(() => import("./pages/Admin/AdminDashboard"));
const CreateQuiz = React.lazy(() => import("./components/quiz/CreateQuiz"));
const TakeQuiz = React.lazy(() => import("./components/quiz/TakeQuiz"));
const QuizResults = React.lazy(() => import("./components/quiz/QuizResults"));
const QuizHistory = React.lazy(() => import("./components/quiz/QuizHistory"));
const PhysicsChapters = React.lazy(() => import("./components/notes/PhysicsChapters"));
const NotesViewer = React.lazy(() => import("./components/notes/NotesViewer"));

import ProtectedRoute from "./components/ProtectedRoute";
import { Skeleton } from "./components/Skeleton"; // Use our new Skeleton component

import { useSelector } from "react-redux";
import { useEffect } from "react";

function App() {
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={conf.toast}
      />
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Loading...</div>}>
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

          {/* Protected Routes - Only accessible when logged in */}
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
        </Routes>
      </React.Suspense>
    </>
  );
}

export default App;
