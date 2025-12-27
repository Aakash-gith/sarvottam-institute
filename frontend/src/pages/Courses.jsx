
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import { getCourses, enrollInCourse } from "../api/courses";
import { Layers, Loader, CheckCircle, Clock, Video, Award, Search, Filter, BookOpen, Star, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../api/axios";

function Courses() {
    const userData = useSelector((state) => state.auth.userData);
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // Get Filter Type from URL
    const queryParams = new URLSearchParams(location.search);
    const typeFilter = queryParams.get("type"); // 'paid' or 'free'

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                setCourses(data);
            } catch (error) {
                toast.error("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        // 1. Search Filter
        const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Type Filter (Paid vs Free)
        let matchType = true;
        if (typeFilter === 'paid') {
            matchType = course.price > 0;
        } else if (typeFilter === 'free') {
            matchType = course.price === 0;
        }

        // 3. Class Filter
        // Relaxed match: Check if course.classLevel includes the user's class number
        const userClass = userData?.class?.toString();
        const isAdmin = userData?.role === 'admin';
        const matchClass = (userClass && !isAdmin) ? course.classLevel?.toLowerCase().includes(userClass) : true;

        // Ensure price is treated as number
        const price = Number(course.price);
        if (typeFilter === 'paid') {
            matchType = price > 0;
        } else if (typeFilter === 'free') {
            matchType = price === 0;
        }

        return matchSearch && matchType && matchClass;
    });

    const handlePayment = async (course) => {
        try {
            setEnrolling(course._id);
            const { data: orderData } = await API.post("/payment/create-order", { courseId: course._id });
            const { order } = orderData;
            const { data: keyData } = await API.get("/payment/get-key");

            const options = {
                key: keyData.key,
                amount: order.amount,
                currency: "INR",
                name: "Sarvottam Institute",
                description: `Enrollment for ${course.title}`,
                image: "https://sarvottam-institute.in/assets/logo.png",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await API.post("/payment/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: course._id
                        });
                        if (verifyRes.data.success) {
                            toast.success("Payment Successful! Enrolled in course.");
                            const data = await getCourses();
                            setCourses(data);
                        }
                    } catch (error) {
                        toast.error("Payment verification failed");
                    }
                },
                theme: { color: "#2563EB" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", (response) => toast.error(response.error.description));
            rzp1.open();
        } catch (error) {
            toast.error("Failed to initiate payment");
        } finally {
            setEnrolling(null);
        }
    };

    const handleEnroll = async (course) => {
        const isEnrolled = userData && course.enrolledStudents && course.enrolledStudents.some(id => id.toString() === userData._id?.toString());
        if (isEnrolled) return toast.success("Already enrolled!");

        if (course.price > 0) {
            handlePayment(course);
        } else {
            setEnrolling(course._id);
            try {
                await enrollInCourse(course._id);
                toast.success("Enrolled successfully!");
                const data = await getCourses();
                setCourses(data);
            } catch (error) {
                // If already enrolled, treat as success but notify user
                if (error.response?.status === 400 && error.response.data.message.includes("already enrolled")) {
                    toast.success("You are already enrolled!");
                    // Refresh to ensure UI sync
                    const data = await getCourses();
                    setCourses(data);
                } else {
                    toast.error(error.response?.data?.message || "Enrollment failed");
                }
            } finally {
                setEnrolling(null);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 transition-all duration-300 ml-0 md:ml-[120px]">
                <div className="max-w-7xl mx-auto p-4 pt-20 md:p-8 md:pt-8">
                    {/* Header Section */}
                    <header className="mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                                    {typeFilter ? `${typeFilter} Batches` : 'All Batches'}
                                    {userData?.class ? ` (Class ${userData.class})` : ''}
                                </h1>
                                <p className="text-gray-500 dark:text-slate-400 mt-1">
                                    Premium batches for your success
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                                <Search className="text-gray-400 ml-2" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search for a batch..."
                                    className="bg-transparent border-none outline-none text-gray-700 dark:text-slate-200 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tabs */}

                    </header>

                    {/* Course Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="flex flex-col items-center gap-6">
                                <div className="loader"></div>
                                <p className="text-[#514b82] dark:text-[#5d56b0] font-bold text-lg animate-pulse tracking-wide">Loading...</p>
                            </div>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
                                <Layers size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                No {typeFilter || ''} batches found
                            </h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-4">
                                We couldn't find any courses matching your criteria {userData?.class ? `for Class ${userData.class}` : ''}.
                            </p>


                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => {
                                const isEnrolled = userData && course.enrolledStudents?.some(id => id.toString() === userData._id?.toString());
                                const originalPrice = Math.round(course.price * 1.4); // Mock original price

                                return (
                                    <div key={course._id} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                        {/* Image Section */}
                                        <div className="relative h-48 bg-slate-200 dark:bg-slate-700">
                                            {course.thumbnail ? (
                                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <Layers size={48} />
                                                </div>
                                            )}

                                            {/* Tags */}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                                                    LIVE
                                                </span>
                                                <span className="bg-black/50 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded border border-white/20">
                                                    HINGLISH
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                                {course.title}
                                            </h3>

                                            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-xs text-gray-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} className="text-blue-500" />
                                                    <span>Starts: {new Date(course.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} className="text-orange-500" />
                                                    <span>Validity: 1 Year</span>
                                                </div>
                                            </div>

                                            {/* Features List */}
                                            {course.features && course.features.length > 0 && (
                                                <ul className="mb-4 space-y-1">
                                                    {course.features.slice(0, 2).map((feature, idx) => (
                                                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                                                            <CheckCircle size={12} className="text-green-500" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                    {course.features.length > 2 && (
                                                        <li className="text-[10px] text-blue-500 font-medium pl-5">+ {course.features.length - 2} more features</li>
                                                    )}
                                                </ul>
                                            )}

                                            {/* Features Divider */}
                                            <div className="border-t border-gray-100 dark:border-slate-700 my-3"></div>

                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-end gap-2">
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {course.price > 0 ? `₹${course.price}` : 'Free'}
                                                    </span>
                                                    {course.price > 0 && (
                                                        <>
                                                            <span className="text-sm text-gray-400 line-through mb-1">
                                                                ₹{originalPrice}
                                                            </span>
                                                            <span className="text-xs text-green-600 font-bold mb-1 bg-green-50 dark:bg-green-900/30 px-1 rounded">
                                                                40% OFF
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto grid grid-cols-2 gap-3">
                                                <button className="py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer">
                                                    Explore
                                                </button>
                                                {isEnrolled ? (
                                                    <a
                                                        href="/my-courses"
                                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center"
                                                    >
                                                        Open Course
                                                    </a>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEnroll(course)}
                                                        disabled={enrolling === course._id}
                                                        className="py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center"
                                                    >
                                                        {enrolling === course._id ? (
                                                            <Loader className="animate-spin" size={18} />
                                                        ) : "Enroll Now"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Courses;
