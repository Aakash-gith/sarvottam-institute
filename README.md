# 🎓 Sarvottam Institute

Sarvottam Institute is a comprehensive full-stack educational web application designed to enhance the student learning experience for both college and school-level (Grade 9-10) students. It provides an interactive platform for AI-powered quizzes, academic progress tracking, personalized learning materials, video lectures, and campus management features.

---

## ✨ Features

### 🧠 AI-Powered Quiz System

- **Dynamic Quiz Generation**: Create quizzes on any topic using Groq AI (Llama 3.3-70b-versatile model)
- **Customizable Parameters**: Set number of questions (1-50) and time limits (1-180 minutes)
- **Real-time Timer**: Auto-submit on timeout with progress tracking
- **Detailed Results**: View score, accuracy, and performance grades (A+ to F)
- **Email Explanations**: Receive detailed answer explanations via email
- **Quiz History**: Track all past attempts with pagination and delete functionality

### 👤 User Profile & Stats

- **Profile Management**: Update name and profile picture (upload, camera capture, or remove)
- **Semester Selection**: Switch between semesters 1-8 for relevant content
- **Comprehensive Stats**: View total quizzes, best score, average score, accuracy rate
- **Login Streak Tracking**: Track daily login streaks with best streak record
- **Favorite Topics**: See your most-quizzed topics ranked

### 📚 Learning Center

- **Semester-wise Subjects**: Access course materials organized by semester (1-8) for college students
- **School Curriculum**: Dedicated learning sections for Class 9 & 10 (Maths & Science) with video lectures and structured notes
- **Digital Notes**: Premium quality HTML-based notes for Physics, Biology, and more
- **Video Learning**: Integrated video lectures organized by subject and chapter
- **Progress Tracking**: Mark lectures as watched and track completion

### 📅 Events & Calendar

- **Event Management**: Create, view, and manage campus events
- **Task Tracking**: Create and complete personal tasks
- **Interactive Calendar**: Monthly view with event indicators and month/year navigation

### 🎨 Modern UI/UX

- **Hamburger Navigation**: Clean collapsible sidebar with active route highlighting
- **Full-width HeaderBar**: Real-time clock, news ticker, notifications, quick stats
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Theme**: Eye-friendly purple-accented dark theme

### 🔐 Authentication

- **Secure Login/Signup**: JWT-based authentication with refresh tokens
- **Email Verification**: OTP-based email verification for new accounts
- **Password Reset**: Forgot password functionality with email OTP

### 🛠️ Admin Dashboard

- **Analytics**: Comprehensive visual reports on user growth, quiz activity, and system usage
- **User Management**: View and manage detailed user profiles
- **Activity Logs**: Track recent system activities including new registrations and events
- **Content Management**: Tools to manage platform content

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Clone the repository

```bash
git clone https://github.com/gp91bits/EduGenie.git
cd Sarvottam
```

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
# Server
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/sarvottam

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email Configuration (for OTP and quiz explanations)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# AI API (for quiz generation)
GROQ_API_KEY=your_groq_api_key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

4. Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI Library
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **Redux Toolkit** - State Management
- **React Router DOM** - Routing
- **Axios** - HTTP Client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend

- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File Uploads
- **Nodemailer** - Email Service
- **Bytez.js/Groq SDK** - AI Integration (Llama 3 via Groq)
- **Upstash Redis** - Caching & Rate Limiting

---

## 📁 Project Structure

```
Sarvottam Institute/
├── backend/
│   ├── conf/           # Configuration files (database, mail, redis)
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth & admin middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── uploads/        # File uploads (profile pictures)
│   └── index.js        # Server entry point
│
├── frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── api/        # API service functions
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       ├── Routes/     # Route configuration
│       ├── store/      # Redux store & slices
│       └── main.jsx    # App entry point
│
├── grade9/             # Class 9 Static Content
│   ├── notes/          # Subject notes
│   ├── videos/         # Video learning resources
│   └── [subjects].html # Subject landing pages
│
├── grade10/            # Class 10 Static Content
│   ├── notes/          # Subject notes
│   ├── videos/         # Video learning resources
│   └── [subjects].html # Subject landing pages
│
└── README.md
```

---

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Quiz

- `POST /api/quiz/create` - Create new quiz
- `GET /api/quiz/attempt/:attemptId` - Get active quiz
- `POST /api/quiz/attempt/:attemptId/answer` - Submit answer
- `POST /api/quiz/attempt/:attemptId/submit` - Complete quiz
- `GET /api/quiz/results/:attemptId` - Get quiz results
- `GET /api/quiz/history` - Get quiz history
- `GET /api/quiz/stats` - Get user stats
- `DELETE /api/quiz/attempt/:attemptId` - Delete quiz

### User Profile

- `GET /api/user/profile-stats` - Get profile statistics
- `PUT /api/user/update-name` - Update user name
- `PUT /api/user/update-semester` - Update semester
- `POST /api/user/upload-profile-picture` - Upload profile picture
- `DELETE /api/user/remove-profile-picture` - Remove profile picture

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Made with ❤️ for learners
