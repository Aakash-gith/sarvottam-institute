import React, { useState, useEffect } from "react";
import { Upload, CheckCircle2, Trash2, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

function PYQUpload() {
    const [formData, setFormData] = useState({
        subject: "",
        class: "",
        year: "",
        examType: "",
        file: null,
    });
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [uploadedPYQ, setUploadedPYQ] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);

    const subjects = ["Maths", "Science"];
    const classes = ["10"]; // Currently only Class 10 supported for PYQs
    const years = ["2023", "2024", "2025"];
    const examTypes = ["Half Yearly", "Annual", "Board"];

    const fetchPYQs = async () => {
        setFetching(true);
        try {
            const { data } = await API.get("/pyq");
            const allPyqs = [];
            if (data.subjects) {
                Object.keys(data.subjects).forEach(subject => {
                    data.subjects[subject].forEach(item => {
                        allPyqs.push({
                            ...item,
                            subject: subject,
                            // If uploadedAt is missing, use a fallback
                            date: item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "N/A"
                        });
                    });
                });
            }
            // Sort by newest first
            allPyqs.sort((a, b) => {
                if (a.uploadedAt && b.uploadedAt) {
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                }
                return 0;
            });
            setUploadedPYQ(allPyqs);
        } catch (error) {
            console.error("Failed to fetch PYQs", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchPYQs();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error("File size must be less than 50MB");
                return;
            }
            if (!file.type.includes("pdf") && !file.type.includes("image")) {
                toast.error("Only PDF and image files are allowed");
                return;
            }
            setFormData((prev) => ({
                ...prev,
                file: file,
            }));
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.subject ||
            !formData.class ||
            !formData.year ||
            !formData.examType ||
            !formData.file
        ) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("subject", formData.subject);
            data.append("class", formData.class);
            data.append("year", formData.year);
            data.append("examType", formData.examType);
            data.append("file", formData.file);

            await API.post("/pyq/upload", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("PYQ uploaded successfully!");
            fetchPYQs(); // Refresh list
            setShowUploadForm(false); // Go back to list

            setFormData({
                subject: "",
                class: "",
                year: "",
                examType: "",
                file: null,
            });
            setFileName("");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Error uploading PYQ");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (subject, id) => {
        if (!window.confirm("Are you sure you want to delete this PYQ?")) return;

        try {
            await API.post("/pyq/delete", { subject, id });
            toast.success("PYQ deleted successfully");
            fetchPYQs();
        } catch (error) {
            toast.error("Failed to delete PYQ");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">PYQ Papers</h2>
                    <p className="text-gray-500 mt-1">Manage Previous Year Questions</p>
                </div>
                {!showUploadForm && (
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>Upload New</span>
                    </button>
                )}
            </div>

            {showUploadForm ? (
                /* Upload Form */
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
                        <button
                            onClick={() => setShowUploadForm(false)}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">Upload New Paper</h3>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="class"
                                        value={formData.class}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((c) => (
                                            <option key={c} value={c}>
                                                Class {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Select Year</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Exam Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="examType"
                                        value={formData.examType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Select Exam Type</option>
                                        {examTypes.map((e) => (
                                            <option key={e} value={e}>
                                                {e}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Paper <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                    <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-input"
                                    />
                                    <label htmlFor="file-input" className="cursor-pointer w-full h-full block">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-gray-900 font-semibold text-lg">
                                            {fileName || "Click to upload or drag and drop"}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            PDF or image files up to 50MB
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadForm(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    {loading ? "Uploading..." : "Upload Paper"}
                                    {!loading && <Upload size={20} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                /* Uploaded PYQ List */
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    {fetching ? (
                        <div className="p-12 text-center">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading papers...</p>
                        </div>
                    ) : uploadedPYQ.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {uploadedPYQ.map((paper, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">
                                                {paper.label}
                                            </h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{paper.subject}</span>
                                                <span>•</span>
                                                <span>Uploaded on {paper.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={paper.file.startsWith("http") ? paper.file : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${paper.file}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                                        >
                                            View
                                        </a>
                                        <button
                                            onClick={() => handleDelete(paper.subject, paper.id || paper.file)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <Upload size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Papers Uploaded Yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                Upload previous year question papers to help students prepare for their exams.
                            </p>
                            <button
                                onClick={() => setShowUploadForm(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md"
                            >
                                <Plus size={20} />
                                <span>Upload First Paper</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PYQUpload;
