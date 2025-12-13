import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import API from "../../api/axios";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  // const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const email = localStorage.getItem("emailVerify");
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!email) navigate("/auth/login");
  }, [email, navigate]);
  useEffect(() => {
    if (status) navigate("/");
  }, [status, navigate]);

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!email) {
      alert("Session expired. Please sign up again.");
      navigate("/auth/signup");
      return;
    }
    try {
      const response = await API.post("/auth/verify", {
        email,
        otp,
        type: location.state?.type,
      });
      if (location.state?.type == "reset") {
        alert("Password has been reset...");
        localStorage.removeItem("emailVerify");
        navigate("/auth/login");
      }
      if (location.state?.type == "signup") {
        const { user, accessToken, refreshToken } = response.data;
        dispatch(login({ user, accessToken, refreshToken }));

        alert("Account verified! Logging you in...");
        localStorage.removeItem("emailVerify");
        navigate("/");
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Verification failed");
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email) {
      alert("Session expired. Please sign up again.");
      return;
    }
    setTimeLeft(30);

    try {
      await API.post("/auth/resendotp", {
        email,
        type: location.state?.type,
      });
      alert("New OTP sent to your email!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left panel - Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-gray-900 text-4xl font-bold mb-3">Verify OTP</h1>
            <p className="text-gray-600 text-base leading-relaxed">
              Enter the 6-digit code sent to your email address to verify your account
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOTP();
            }}
            className="space-y-6"
          >
            <div>
              <label className="text-gray-700 text-sm font-medium block mb-3">
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                className="w-full bg-white text-gray-900 px-4 py-4 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm hover:shadow-md text-center text-2xl tracking-widest font-semibold"
                placeholder="000000"
                required
              />
              <p className="text-gray-500 text-xs mt-2">Check your email for the OTP code</p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Verify & Continue
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={timeLeft > 0}
              className={`w-full border-2 font-semibold py-3 rounded-lg transition-all duration-200 cursor-pointer ${timeLeft > 0
                ? "border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
                }`}
            >
              {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : "Resend OTP"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOTP}
              disabled={timeLeft > 0}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Try again
            </button>
          </p>
        </div>
      </div>

      {/* Right panel - Illustration */}
      <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-12 relative overflow-hidden flex-col justify-center items-center">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-2xl">
          {/* Email Icon SVG */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-5xl font-bold mb-6 leading-tight">
            Check Your Email
          </h2>
          <p className="text-blue-100 text-xl leading-relaxed mb-4">
            We've sent a verification code to your email address
          </p>
          <p className="text-blue-200 text-lg">
            {email && (
              <span>
                Email: <span className="font-semibold text-white">{email}</span>
              </span>
            )}
          </p>

          {/* Animated circles */}
          <div className="mt-12 flex justify-center gap-2">
            <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
