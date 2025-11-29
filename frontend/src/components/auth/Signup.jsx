import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../api/axios";

// Comprehensive list of legitimate email providers
// Only these domains are allowed to register/login
const LEGITIMATE_EMAIL_DOMAINS = [
  // Major global providers
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "pm.me",
  "icloud.com",
  "mac.com",
  "me.com",
  "zoho.com",
  "yandex.com",

  // Indian email providers
  "rediffmail.com",
  "indiatimes.com",
  "sify.com",
  "airtel.com",
  "bsnl.com",
  "vodafone.com",
  "idea.com",

  // Educational institutions (add your known schools/colleges)
  "mit.edu",
  "stanford.edu",
  "berkeley.edu",
  "harvard.edu",
  "iitb.ac.in",
  "iitd.ac.in",
  "iitk.ac.in",
  "iitm.ac.in",
  "iitp.ac.in",
  "iitr.ac.in",
  "iitbhu.ac.in",
  "iitg.ac.in",
  "iit.ac.in",

  // Professional/Corporate domains commonly used
  "company.com",

  // Other legitimate services
  "tutanota.com",
  "posteo.de",
  "mailbox.org",
];

const isValidEmailDomain = (email) => {
  const domain = email.toLowerCase().split("@")[1];

  if (!domain) return false;

  // Only allow whitelisted domains - strict whitelist approach
  return LEGITIMATE_EMAIL_DOMAINS.includes(domain);
};

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    class: "",
  });

  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status) navigate("/");
  }, [status, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate email domain
    if (!isValidEmailDomain(formData.email)) {
      setError("Please use a valid email address. Temporary email services are not allowed.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    try {
      const response = await API.post("/auth/signup", formData);

      localStorage.setItem("emailVerify", formData.email);

      if (response.status === 200) {
        navigate("/auth/verify", { state: { type: "signup" } });
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      setError(error.response?.data.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      <style>{`
        select#class option {
          border-radius: 0.5rem;
          padding: 0.75rem;
        }
        select#class option:hover {
          background-color: #2563eb;
          color: white;
        }
      `}</style>
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-gray-900 text-4xl font-bold mb-2">Sign Up</h1>
            <p className="text-gray-600 text-sm">Create your student account</p>
          </div>

          {error && <p className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-6">{error}</p>}

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="text-gray-700 text-sm font-medium block mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm hover:shadow-md"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-gray-700 text-sm font-medium block mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm hover:shadow-md"
                placeholder="Enter email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-gray-700 text-sm font-medium block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm hover:shadow-md pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <label htmlFor="class" className="text-gray-700 text-sm font-medium block mb-2">
                Class
              </label>
              <select
                id="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231f2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  paddingRight: "2.5rem"
                }}
                required
              >
                <option value="" style={{ borderRadius: "0.5rem", padding: "0.75rem" }}>Select your class</option>
                <option value="9" style={{ borderRadius: "0.5rem", padding: "0.75rem" }}>Class IX (9th)</option>
                <option value="10" style={{ borderRadius: "0.5rem", padding: "0.75rem" }}>Class X (10th)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-8 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <button
              onClick={() => navigate("/auth/login")}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div
        className="hidden lg:flex w-3/5 bg-gradient-to-br from-blue-600 to-blue-700 p-12 relative overflow-hidden flex-col justify-center"
      >
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-white text-5xl font-bold mb-4">Join Sarvottam Institute</h2>
          <p className="text-blue-100 text-lg mb-8">
            Learn mathematics and science with interactive content, practice quizzes, and expert guidance. Start your journey to excellence today.
          </p>
          <div className="space-y-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Comprehensive study materials</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Practice with unlimited quizzes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Track your progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
