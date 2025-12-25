
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import { getCourses, enrollInCourse } from "../api/courses";
import { Layers, Loader, CheckCircle, Clock, Video, Award, Search, Filter, BookOpen, Star, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../api/axios";

function Courses() {
    const userData = useSelector((state) => state.auth.userData);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

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
        const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        // For now, tab filters could be mocked or based on descriptions if available
        // Assuming we allow filtering by simple logic or future fields
        if (activeTab === "all") return matchSearch;
        return matchSearch;
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
                toast.error("Enrollment failed");
            } finally {
                setEnrolling(null);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 transition-all duration-300 ml-0 md:ml-[120px]">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {/* Header Section */}
                    <header className="mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Our Courses
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
                        <div className="flex gap-4 mt-8 overflow-x-auto pb-2 no-scrollbar">
                            {['all', 'Class 12', 'Class 11', 'Class 10', 'Class 9'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all
                                        ${activeTab === tab
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {tab === 'all' ? 'All Batches' : tab}
                                </button>
                            ))}
                        </div>
                    </header>

                    {/* Course Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader className="animate-spin text-blue-600" size={40} />
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

                                            {/* Features Divider */}
                                            <div className="border-t border-gray-100 dark:border-slate-700 my-3"></div>

                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-end gap-2">
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        ₹{course.price}
                                                    </span>
                                                    {course.price > 0 && (
                                                        <span className="text-sm text-gray-400 line-through mb-1">
                                                            ₹{originalPrice}
                                                        </span>
                                                    )}
                                                    {course.price > 0 && (
                                                        <span className="text-xs text-green-600 font-bold mb-1 bg-green-50 dark:bg-green-900/30 px-1 rounded">
                                                            40% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto grid grid-cols-2 gap-3">
                                                <button className="py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer">
                                                    Explore
                                                </button>
                                                <button
                                                    onClick={() => handleEnroll(course)}
                                                    disabled={enrolling === course._id || isEnrolled}
                                                    className={`py-2.5 px-4 rounded-xl text-sm font-bold text-white transition shadow-lg
                                                        ${isEnrolled
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                                        }`}
                                                >
                                                    {enrolling === course._id ? (
                                                        <Loader className="animate-spin mx-auto" size={18} />
                                                    ) : isEnrolled ? "Enrolled" : "Enroll Now"}
                                                </button>
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
