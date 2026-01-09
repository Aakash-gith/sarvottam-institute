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
- **Video Learning Hub**: A dedicated, distraction-free environment for Class 9 & 10 video lectures with subject-wise organization.
- **Live Class Integration**: Seamless live sessions powered by **100ms** RoomKit for real-time interaction.
- **Interactive Notes**: Premium, structure-optimized HTML notes for Mathematics and Science, accessible across all devices.
- **Progress Tracking**: Granular, weighted completion tracking for chapters, subjects, and entire courses.
- **Gamified Streaks**: Motivation system with daily learning streaks to encourage consistency.

### 💳 Financial & Support Infrastructure
- **Razorpay Integration**: Professional-grade payment gateway for secure course enrollments and automated invoicing.
- **Advanced Support Framework**: Real-time ticketing system for student queries and dedicated chat channels.
- **Instant Media Management**: High-speed profile media handling via **ImageKit.io** CDN.

### 🔐 Administrative Excellence
- **Master Admin Dashboard**: Comprehensive control over user accounts, including security resets and instant lock/unlock features.
- **Deep Analytics**: Student-specific performance heatmaps, activity tracking, and comprehensive progress reports.
- **Content Management**: Global control over news tickers, event calendars, and curriculum distribution.
- **Multi-tier Security**: JWT-based authentication with secure rotation, refresh cycles, and role-based access control.

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19** & **Vite**: Ultra-fast, modern component architecture.
- **Redux Toolkit**: Centralized global state management.
- **Tailwind CSS 4**: Sophisticated, responsive layout design with premium aesthetics.
- **Lucide React**: Modern, crisp iconography.
- **Recharts**: High-fidelity data visualization for student analytics.
- **100ms SDK**: Professional-grade live video streaming infrastructure.

### **Backend**
- **Node.js (LTS)** & **Express 5**: Robust, scalable server-side environment.
- **MongoDB & Mongoose**: Flexible schema design with advanced aggregation pipelines for analytics.
- **Upstash Redis**: High-performance caching and distributed rate-limiting.
- **Nodemailer**: Reliable transactional email infrastructure for receipts and reports.
- **Groq & Google AI**: Multi-model AI integration for intelligent learning features.
- **ImageKit**: Cloud-native image optimization and global CDN delivery.
- **Razorpay SDK**: Secure payment processing and subscription management.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- ImageKit.io account (for profile media)
- Groq/Google AI API keys
- Razorpay API credentials
- Upstash Redis account
- Gmail App Password (for transactional emails)

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
   # MAIL_USER, MAIL_PASS, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
   # GROQ_API_KEY, GEMINI_API_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY
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
*Building the future of digital education with precision and passion.*
