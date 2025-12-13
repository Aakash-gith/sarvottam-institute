import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../../api/axios";
import { login } from "../../store/authSlice";

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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status || localStorage.getItem("accessToken")) {
      navigate("/", { replace: true });
    }
  }, [status, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate email domain
    if (!isValidEmailDomain(formData.email)) {
      setError("Please use a valid email address. Temporary email services are not allowed.");
      return;
    }

    try {
      const { data } = await API.post("/auth/login", formData);
      const { user, accessToken, refreshToken } = data;
      dispatch(login({ user, accessToken, refreshToken }));
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-2/5 bg-bg flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-gray-900 text-4xl font-bold mb-2">Login</h1>
          <p className="text-gray-600 text-sm mb-8">
            Enter your account details
          </p>
          {error && <p className="text-red-400">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="text-gray-700 text-sm block mb-2 font-semibold"
              >
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

            <div>
              <label
                htmlFor="password"
                className="text-gray-700 text-sm block mb-2 font-semibold"
              >
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-left">
              <button
                type="button"
                onClick={() => navigate("/auth/forgot-pass")}
                className="text-blue-600 text-sm hover:text-blue-700 font-medium transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Login
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-600 text-sm">
              Don't have an account?{" "}
            </span>
            <button
              onClick={() => navigate("/auth/signup")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ml-2 cursor-pointer"
            >
              Sign up
            </button>
          </div>

          {/* Admin Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <p className="text-gray-600 text-sm text-center mb-3">
              Are you an admin?
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div
        className="hidden lg:flex w-3/5 bg-accent p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url("/assets/auth_bg.jpeg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-md self-center lg:mt-[-80px] xl:mt-[-60px]">
          <h2 className="text-white text-xl lg:text-2xl xl:text-3xl font-bold mb-2 leading-tight">
            Welcome to
          </h2>
          <h2 className="text-white text-xl lg:text-2xl xl:text-3xl font-bold mb-3 leading-tight">
            Student Portal
          </h2>
          <p className="text-red-200 text-xs lg:text-sm">
            Login to access your account
          </p>
        </div>
      </div>
    </div>
  );
}
