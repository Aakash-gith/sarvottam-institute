# 🎓 Sarvottam Institute

Sarvottam Institute is a state-of-the-art educational ecosystem designed to empower students and administrators with cutting-edge learning and management tools. Built with a focus on Grade 9-10 (Maths & Science) and College-level curriculum, it integrates AI-driven assessment, rigorous progress tracking, and a premium user experience.

---

## ✨ Features

### 🧠 AI-Powered Quiz System
- **Intelligent Generation**: Dynamic quizzes powered by Groq AI (Llama 3.3-70b) on any requested topic.
- **Precision Customization**: Define question count (1-50) and strict time limits.
- **Adaptive Evaluation**: Real-time scoring with performance grades (A+ to F).
- **Automated Insights**: Detailed answer keys and explanations sent via Nodemailer.
- **Historical Analysis**: Comprehensive history of all attempts with performance trends.

### 👤 Student Learning Experience
- **Personalized Dashboard**: Real-time stats on quiz performance, accuracy, and learning streaks.
- **Video Learning Hub**: Dedicated, distraction-free section for Class 9 & 10 video lectures.
- **Structured Digital Notes**: Premium HTML-based interactive notes for Science and Mathematics.
- **Progress Tracking**: Subject-wise and chapter-wise completion indicators.
- **Streak System**: Gamified daily login tracking to build consistent study habits.

### 🔐 Master Admin & Security
- **Dynamic Account Controls**: Master Admins can instantly lock/unlock user accounts for security.
- **Sensitive Reset Actions**: Administrative password reset functionality with secure OTP delivery.
- **Role-Based Access**: Multi-tier permission levels (Student, Admin, Master Admin).
- **Security Protocols**: JWT-based stateless authentication with secure refresh cycles.

### 📊 Advanced Admin Dashboard
- **Student Analytics**: Deep-dive into individual student progress, quiz history, and activity graphs.
- **User Directory**: Centralized management for students and sub-admins with quick-action toggles.
- **System Metrics**: Visual reports on platform growth, resource distribution, and engagement.
- **Global Settings**: Control over news tickers, event calendars, and platform-wide notifications.

### 🎨 Premium UI/UX
- **Modern Sidebar**: Dynamic, collapsible navigation with an integrated profile dropdown.
- **Dark Mode First**: Sleek, eye-friendly design with premium purple and teal accents.
- **Responsive Fluidity**: Seamless transition between high-density desktop views and streamlined mobile layouts.
- **Micro-Animations**: Smooth transitions and interactive feedback for a premium feel.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Community Edition)
- Gmail App Password (for Nodemailer)

### Installation
1. **Clone & Install**
   ```bash
   git clone https://github.com/gp91bits/Sarvottam-Institute.git
   cd sarvottam-institiute
   npm install # in both frontend and backend
   ```

2. **Environment Configuration (Backend)**
   Create a `.env` file in `backend/`:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   
   # Gmail/Nodemailer Config
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password
   
   # AI Integration
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Environment Configuration (Frontend)**
   Create a `.env` file in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

### Execution
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run dev
```

---

## 🛠️ Tech Stack

### Frontend & Design
- **React 18** (Vite-powered)
- **TailwindCSS** for layout & sizing
- **Vanilla CSS** for premium custom components (Sidebar, Modals)
- **Redux Toolkit** (Global state management)
- **Lucide React** (Modern iconography)

### Backend & Infrastructure
- **Node.js & Express**
- **Mongoose** (Advanced aggregation for analytics)
- **Nodemailer** (Robust email infrastructure)
- **Groq AI SDK** (Llama 3 series)
- **Upstash Redis** (Caching layer)

---

## 📁 Key Directories
- `backend/controllers`: Core business logic and AI integration.
- `frontend/src/components/admin`: Specialized administrative tools.
- `frontend/src/pages/Student`: Personalized student learning modules.
- `grade9/grade10`: Static content repository for core school subjects.

---

## 📝 Administrative API (Master Admin)
- `PUT /api/admin/users/:userId/lock` - Toggle user access status.
- `PUT /api/admin/users/:userId/reset-password` - Generate and mail temporary credentials.
- `GET /api/admin/users/:userId/analytics` - Fetch deep-dive performance metrics for a student.

---

## 📄 License
This project is licensed under the MIT License.

## 👨‍💻 Developed By
**Sarvottam Institute Engineering Team**
*Empowering the next generation of learners.*
