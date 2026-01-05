# 🎓 Sarvottam Institute

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-20+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Sarvottam Institute** is a premium, full-stack educational ecosystem designed for the modern era. Specializing in Grade 9-10 (Mathematics & Science), the platform integrates advanced AI assessment, real-time progress tracking, and a high-performance learning environment.

---

## 🚀 Key Features

### 🧠 Intelligent Learning & Assessment
- **AI Quiz Engine**: Dynamic quiz generation powered by **Groq (Llama 3)** and **Google Gemini**, offering tailored assessments on any topic.
- **Adaptive Scoring**: Real-time evaluation with detailed performance analytics and historical trend tracking.
- **Comprehensive Gradebook**: Automated results delivery via email with AI-generated feedback.

### 🎥 Modern Learning Experience
- **Video Learning Hub**: A dedicated, distraction-free environment for Class 9 & 10 video lectures.
- **Live Class Integration**: Seamless live sessions powered by **100ms** RoomKit.
- **Interactive Notes**: Premium, structure-optimized HTML notes for Mathematics and Science.
- **Progress Tracking**: Granular, weighted completion tracking for chapters and subjects.
- **Gamified Streaks**: Motivation system to encourage daily learning consistency.

### 👤 Profile & Communication
- **Media Management**: Fast, secure profile picture uploads integrated with **ImageKit.io**.
- **Real-time Notifications**: Instant alerts for system updates and unread communications.
- **Unified Messaging**: Integrated communication channels for students and mentors.

### 🔐 Administrative Excellence
- **Master Admin Dashboard**: Full control over user accounts, including instant locking/unlocking and security resets.
- **Deep Analytics**: Student-specific performance metrics, activity heatmaps, and progress reports.
- **Global Configuration**: Manage platform-wide news tickers, event calendars, and resource distribution.
- **Multi-tier Security**: JWT-based authentication with secure refresh cycles and role-based access control.

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19** & **Vite**: Ultra-fast, modern component architecture.
- **Redux Toolkit**: Centralized global state management.
- **Tailwind CSS 4**: Sophisticated, responsive layout design.
- **Lucide React**: Modern, crisp iconography.
- **Recharts**: Dynamic data visualization for student analytics.
- **100ms SDK**: Professional-grade live video streaming.

### **Backend**
- **Node.js (LTS)** & **Express 5**: Robust, scalable server-side environment.
- **MongoDB & Mongoose**: Flexible schema design with advanced aggregation pipelines.
- **Upstash Redis**: High-performance caching and rate-limiting.
- **Nodemailer**: Reliable transactional email infrastructure.
- **Groq & Google AI**: Multi-model AI integration for intelligent features.
- **ImageKit**: Cloud-based image optimization and CDN delivery.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- ImageKit.io account (for profile media)
- Groq/Google AI API keys
- Gmail App Password (for email features)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/gp91bits/Sarvottam-Institute.git
   cd sarvottam-institiute
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env with the following:
   # PORT, MONGODB_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET
   # MAIL_USER, MAIL_PASS
   # GROQ_API_KEY, GEMINI_API_KEY
   # IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
   # REDIS_URL, REDIS_TOKEN
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create .env with:
   # VITE_API_BASE_URL=http://localhost:3000/api
   npm run dev
   ```

---

## 📁 Project Structure
- `frontend/`: React application with Vite, Tailwind, and Redux.
- `backend/`: Express API with AI integrations and Mongoose models.
- `grade9/ / grade10/`: Specialized static content for core subject notes.
- `deploy-setup.sh`: Automated deployment configuration script.

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developed By
**Sarvottam Institute Engineering Team**  
*Building the future of digital education.*
