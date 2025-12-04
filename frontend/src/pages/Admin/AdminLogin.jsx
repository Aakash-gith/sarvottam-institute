import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, Clock } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("login"); // "login", "otp", or completed
    const [requiresOTP, setRequiresOTP] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const navigate = useNavigate();

    // OTP Timer countdown
    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await API.post("/admin/login", { email, password });

            if (response.data.success) {
                if (response.data.data.requiresOTP) {
                    // Master admin - requires OTP
                    setRequiresOTP(true);
                    setStep("otp");
                    
                    // Send OTP
                    try {
                        await API.post("/admin/login/send-otp", { email });
                        setOtpTimer(600); // 10 minutes
                        toast.success("OTP sent to your email");
                    } catch (error) {
                        toast.error("Failed to send OTP. Please try again.");
                        setStep("login");
                    }
                } else {
                    // Regular admin
                    const { token, role } = response.data.data;
                    localStorage.setItem("adminEmail", email);
                    localStorage.setItem("accessToken", token);
                    localStorage.setItem("adminRole", role);
                    navigate("/admin/dashboard");
                    toast.success("Welcome to Admin Panel!");
                }
            }
        } catch (error) {
            const message = error.response?.data?.message;

            if (message === "pending") {
                localStorage.setItem("adminEmail", email);
                navigate("/admin/request-status");
                toast.info("Your request is under review");
            } else if (message === "rejected") {
                const data = error.response?.data?.data;
                navigate("/admin/request-rejected", {
                    state: { reason: data?.rejectionReason },
                });
            } else if (message === "notfound") {
                navigate("/admin/signup");
                toast.info("Please request admin access first");
            } else {
                toast.error(error.response?.data?.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await API.post("/admin/login/verify-otp", { email, otp });

            if (response.data.success) {
                const { token, role } = response.data.data;
                localStorage.setItem("adminEmail", email);
                localStorage.setItem("accessToken", token);
                localStorage.setItem("adminRole", role);
                navigate("/admin/dashboard");
                toast.success("🔐 Master Admin Panel - Secured Access!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await API.post("/admin/login/send-otp", { email });
            setOtpTimer(600); // Reset 10 minutes
            setOtp(""); // Clear OTP input
            toast.success("New OTP sent to your email");
        } catch (error) {
            toast.error("Failed to resend OTP");
        }
    };

    const handleBackToLogin = () => {
        setStep("login");
        setRequiresOTP(false);
        setOtp("");
        setOtpTimer(0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                        {step === "login" ? "🔐" : "✓🔐"}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {step === "login" ? "Admin Login" : "Verify OTP"}
                    </h1>
                    <p className="text-gray-600 mt-2">Sarvottam Institute</p>
                </div>

                {/* Login Form */}
                {step === "login" && (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Logging in..." : "Login to Admin Panel"}
                            {!loading && <ArrowRight size={20} />}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/admin/forgot-password")}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                        >
                            Forgot Password?
                        </button>
                    </form>
                )}

                {/* OTP Verification Form */}
                {step === "otp" && (
                    <form onSubmit={handleOTPSubmit} className="space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex gap-3">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-700">
                                    <p className="font-semibold mb-1">⚠️ Master Admin Verification</p>
                                    <p>
                                        This is a security feature for master admin access. An OTP has been sent to your registered email.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Check your email ({email}) for the OTP
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                            {!loading && <ArrowRight size={20} />}
                        </button>

                        <div className="flex items-center justify-between gap-2 text-sm">
                            {otpTimer > 0 ? (
                                <span className="flex items-center gap-1 text-gray-600">
                                    <Clock size={16} />
                                    OTP expires in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-red-600 hover:text-red-700 font-medium"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="w-full text-center text-sm text-gray-600 hover:text-gray-700 font-medium py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                {/* Divider */}
                {step === "login" && (
                    <>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">New here?</span>
                            </div>
                        </div>

                        {/* Sign up link */}
                        <button
                            onClick={() => navigate("/admin/signup")}
                            className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                        >
                            Request Admin Access
                        </button>

                        {/* Info Box */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-700">
                                    <p className="font-semibold mb-1">First time?</p>
                                    <p>
                                        Request admin access and wait for approval from the master admin.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminLogin;
