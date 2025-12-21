import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FileText, Eye, ArrowLeft, Filter, X, Lock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import API from "../api/axios";

function PYQ() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();
    const { subjectId } = useParams();

    const [pyqList, setPyqList] = useState([]);
    const [filteredPyq, setFilteredPyq] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedSubject, setSelectedSubject] = useState(subjectId || "all");

    // PDF Viewer State
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
    const [currentPdfTitle, setCurrentPdfTitle] = useState("");

    // Subject Selection State
    const [viewMode, setViewMode] = useState(subjectId ? "papers" : "subjects"); // "subjects" or "papers"

    // Enable security when modal is open
    useSecurity(showPdfModal);

    const classYear = userData?.class || 9;
    const subjects = [
        { id: "maths", name: "Mathematics", icon: "📐", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-200" },
        { id: "science", name: "Science", icon: "🔬", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-200" }
    ];
    const years = ["2023", "2024", "2025"];

    useEffect(() => {
        fetchPYQ();
    }, [classYear]);

    const fetchPYQ = async () => {
        try {
            setLoading(true);
            const response = await API.get("/pyq");
            if (response.data) {
                const data = response.data;
                let pyqList = [];

                if (data.subjects) {
                    Object.entries(data.subjects).forEach(([subject, papers]) => {
                        if (Array.isArray(papers)) {
                            papers.forEach((paper) => {
                                // Construct absolute URL
                                let fileUrl = paper.url || paper.fileUrl || paper.file;
                                if (fileUrl && !fileUrl.startsWith("http")) {
                                    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:3000";
                                    fileUrl = `${baseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
                                }

                                pyqList.push({
                                    _id: `${subject}-${paper.year}-${paper.exam}`,
                                    subject: subject,
                                    year: paper.year?.toString() || "Unknown",
                                    examType: paper.exam || paper.examType || "Exam",
                                    fileUrl: fileUrl,
                                    description: paper.description || "",
                                    label: paper.label || `${subject} ${paper.year}`
                                });
                            });
                        }
                    });
                }

                setPyqList(pyqList);
            }
        } catch (error) {
            console.error("Failed to fetch PYQ:", error);
            setPyqList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = pyqList;

        if (selectedSubject !== "all") {
            filtered = filtered.filter((pyq) =>
                pyq.subject?.toLowerCase() === selectedSubject.toLowerCase()
            );
        }

        if (selectedYear !== "all") {
            filtered = filtered.filter((pyq) => pyq.year === selectedYear);
        }

        setFilteredPyq(filtered);
    }, [selectedSubject, selectedYear, pyqList]);

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setViewMode("papers");
    };

    const handleBackToSubjects = () => {
        setSelectedSubject("all");
        setViewMode("subjects");
    };

    const handleViewPdf = (url, title) => {
        setCurrentPdfUrl(url);
        setCurrentPdfTitle(title);
        setShowPdfModal(true);
    };

    const closePdfModal = () => {
        setShowPdfModal(false);
        setCurrentPdfUrl(null);
        setCurrentPdfTitle("");
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Helmet>
                <title>Previous Year Questions | Sarvottam Institute</title>
                <meta name="description" content="Access previous year questions for Class 9 and Class 10" />
            </Helmet>

            <Sidebar />

            <div className="max-w-7xl mx-auto w-full px-6 py-12 ml-[120px]">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {viewMode === "papers" && (
                                <button
                                    onClick={handleBackToSubjects}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                                    aria-label="Go back"
                                >
                                    <ArrowLeft size={24} className="text-gray-600" />
                                </button>
                            )}
                            {!viewMode === "papers" && (
                                <button
                                    onClick={() => navigate("/")}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                                    aria-label="Go back"
                                >
                                    <ArrowLeft size={24} className="text-gray-600" />
                                </button>
                            )}

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                                    {viewMode === "papers" ? `${selectedSubject} Papers` : "Previous Year Questions"}
                                </h1>
                                <p className="text-gray-600 mt-2">Class {classYear} - Prepare with past papers</p>
                            </div>
                        </div>

                        {/* Year Filter - Only show in papers view */}
                        {viewMode === "papers" && (
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                                <Filter size={18} className="text-gray-500" />
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer outline-none"
                                >
                                    <option value="all">All Years</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* View Mode: Subject Selection */}
                {viewMode === "subjects" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                        {subjects.map((sub) => (
                            <div
                                key={sub.id}
                                onClick={() => handleSubjectSelect(sub.id)}
                                className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl group bg-gradient-to-br ${sub.color} ${sub.shadow}`}
                            >
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black opacity-5 rounded-full blur-xl"></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="text-6xl mb-6 transform group-hover:rotate-12 transition-transform duration-500 drop-shadow-lg">
                                        {sub.icon}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{sub.name}</h2>
                                    <p className="text-white/90 font-medium">Click to view papers</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View Mode: Papers List */}
                {viewMode === "papers" && (
                    <>
                        {/* PYQ List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredPyq.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                                <FileText size={64} className="mx-auto text-gray-300 mb-6" />
                                <p className="text-gray-600 text-xl font-medium">No papers found for {selectedSubject}</p>
                                <p className="text-gray-400 mt-2">Try adjusting the year filter</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPyq.map((pyq) => (
                                    <div
                                        key={pyq._id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 p-6 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">
                                                        {pyq.year || "Year"}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                        {pyq.subject || "Subject"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1 font-medium">
                                                        {pyq.examType || "Exam"}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                    <FileText size={24} />
                                                </div>
                                            </div>

                                            {pyq.description && (
                                                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{pyq.description}</p>
                                            )}

                                            <div className="mt-auto">
                                                {pyq.fileUrl ? (
                                                    <button
                                                        onClick={() => handleViewPdf(pyq.fileUrl, pyq.label)}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg shadow-gray-200 hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        <Eye size={18} />
                                                        View Paper
                                                    </button>
                                                ) : (
                                                    <button disabled className="w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed font-medium">
                                                        Not Available
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Secure PDF Viewer Modal */}
            {showPdfModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 select-none">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Lock size={16} className="text-green-600" />
                                <h3 className="font-semibold truncate max-w-md">{currentPdfTitle}</h3>
                            </div>
                            <button
                                onClick={closePdfModal}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* PDF Container */}
                        <div
                            className="flex-1 relative bg-gray-200 overflow-hidden"
                            onContextMenu={(e) => e.preventDefault()} // Disable right click
                        >
                            {/* Transparent Overlay to discourage dragging/saving */}
                            <div className="absolute inset-0 z-10 bg-transparent" style={{ pointerEvents: 'none' }}></div>

                            {/* Dynamic Watermark */}
                            <div className="absolute inset-0 z-20 pointer-events-none flex flex-wrap content-center justify-center overflow-hidden opacity-10 select-none">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="w-full flex justify-around my-20 transform -rotate-45">
                                        <span className="text-xl font-medium text-gray-400 whitespace-nowrap">
                                            Issued to: {userData?.name || "Student"} • {userData?.phone || userData?.email || "ID: " + (userData?._id || "Unknown")}
                                        </span>
                                        <span className="text-xl font-medium text-gray-400 whitespace-nowrap">
                                            Issued to: {userData?.name || "Student"} • {userData?.phone || userData?.email || "ID: " + (userData?._id || "Unknown")}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <iframe
                                src={`${currentPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full"
                                title="PDF Viewer"
                                style={{ border: 'none' }}
                            />
                        </div>

                        {/* Security Footer */}
                        <div className="p-2 bg-gray-900 text-white text-xs text-center select-none">
                            Educational Material • Distributed by Sarvottam Institute • For Personal Use Only
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Security Hook for Anti-Screenshot
const useSecurity = (isActive) => {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e) => {
            // Block PrintScreen
            if (e.key === "PrintScreen") {
                e.preventDefault();
                alert("Screenshots are disabled for security reasons.");
                return;
            }

            // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+Shift+S (Snipping Tool shortcut on some OS)
            if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s" || (e.shiftKey && e.key === "s"))) {
                e.preventDefault();
                alert("This action is disabled.");
                return;
            }
        };

        const handleBlur = () => {
            document.body.style.filter = "blur(10px)";
        };

        const handleFocus = () => {
            document.body.style.filter = "none";
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            document.body.style.filter = "none"; // Cleanup
        };
    }, [isActive]);
};

export default PYQ;
