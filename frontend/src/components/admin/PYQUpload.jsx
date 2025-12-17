import React, { useState, useEffect } from "react";
import { Upload, CheckCircle2, Trash2, Plus, ArrowLeft, BookOpen, Atom, FileText, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

function PYQUpload() {
    // View State: 'subjects' | 'list' | 'upload'
    const [view, setView] = useState('subjects');
    const [selectedSubject, setSelectedSubject] = useState(null); // 'Maths' or 'Science'

    // Data State
    const [uploadedPYQ, setUploadedPYQ] = useState([]);
    const [loading, setLoading] = useState(false); // For upload action
    const [fetching, setFetching] = useState(false); // For list loading

    // Form State
    const [formData, setFormData] = useState({
        class: "10",
        year: "",
        examType: "",
        file: null,
    });
    const [fileName, setFileName] = useState("");

    // Constants
    const classes = ["10"];
    const years = ["2023", "2024", "2025"];
    const examTypes = ["Half Yearly", "Annual", "Board"];

    useEffect(() => {
        fetchPYQs();
    }, []);

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
                            date: item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "N/A"
                        });
                    });
                });
            }
            // Sort by newest first
            allPyqs.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
            setUploadedPYQ(allPyqs);
        } catch (error) {
            console.error("Failed to fetch PYQs", error);
            toast.error("Could not load papers");
        } finally {
            setFetching(false);
        }
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setView('list');
        // Reset form data for good measure, keeping fixed subject implicit
        setFormData(prev => ({ ...prev, class: "10", year: "", examType: "", file: null }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            setFormData((prev) => ({ ...prev, file: file }));
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!process.env.NODE_ENV && !selectedSubject) { toast.error("System error: No subject selected"); return; }
        if (!formData.class || !formData.year || !formData.examType || !formData.file) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append("subject", selectedSubject); // Use the locked subject
            data.append("class", formData.class);
            data.append("year", formData.year);
            data.append("examType", formData.examType);
            data.append("file", formData.file);

            await API.post("/pyq/upload", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(`${selectedSubject} Paper uploaded successfully!`);
            fetchPYQs();
            setView('list'); // Return to list view

            // Cleanup
            setFormData({ class: "10", year: "", examType: "", file: null });
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
            toast.success("PYQ deleted");
            fetchPYQs();
        } catch (error) {
            toast.error("Failed to delete PYQ");
        }
    };

    // Filtered List
    const subjectPapers = uploadedPYQ.filter(p => p.subject === selectedSubject);

    // --- RENDER HELPERS ---

    const renderSubjectSelection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-8">
            {/* Maths Card */}
            <div
                onClick={() => handleSubjectSelect("Maths")}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Mathematics</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Manage PYQ for Class 10 Maths</p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold gap-2 group-hover:translate-x-1 transition-transform">
                        <span>View Papers</span>
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>

            {/* Science Card */}
            <div
                onClick={() => handleSubjectSelect("Science")}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Atom size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Science</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Manage PYQ for Class 10 Science</p>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold gap-2 group-hover:translate-x-1 transition-transform">
                        <span>View Papers</span>
                        <ChevronRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHeader = () => {
        if (view === 'subjects') return (
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">PYQ Repository</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Select a subject to manage previous year questions</p>
            </div>
        );

        return (
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        if (view === 'upload') setView('list'); // From upload back to list
                        else setView('subjects'); // From list back to subjects
                    }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {selectedSubject} PYQs
                        <span className="text-sm font-normal px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md border border-slate-200 dark:border-slate-700">Class 10</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {view === 'upload' ? 'Upload New Paper' : 'Manage uploaded papers'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate__animated animate__fadeIn">
            {/* Main Header */}
            <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                {renderHeader()}
                {view === 'list' && (
                    <button
                        onClick={() => setView('upload')}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 font-medium"
                    >
                        <Plus size={18} />
                        <span>Upload New</span>
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {/* 1. Subject Selection View */}
                {view === 'subjects' && renderSubjectSelection()}

                {/* 2. List View */}
                {view === 'list' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {fetching ? (
                            <div className="p-12 text-center text-slate-500">Loading...</div>
                        ) : subjectPapers.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {subjectPapers.map((paper, index) => (
                                    <div key={index} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                                                    {paper.label || `${paper.year} ${paper.examType}`}
                                                </h4>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    <span className="capitalize">{paper.examType}</span>
                                                    <span>•</span>
                                                    <span>{paper.year}</span>
                                                    <span>•</span>
                                                    <span>{paper.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={paper.file.startsWith("http") ? paper.file : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${paper.file}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                            >
                                                View PDF
                                            </a>
                                            <button
                                                onClick={() => handleDelete(paper.subject, paper.id || paper.file)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                                    <FileText size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Papers for {selectedSubject}</h3>
                                <p className="text-slate-500 mb-8">Upload the first paper to get started.</p>
                                <button
                                    onClick={() => setView('upload')}
                                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90"
                                >
                                    Upload Now
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Upload View */}
                {view === 'upload' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden max-w-2xl mx-auto">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Auto-Selected Subject Display */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600">
                                        {selectedSubject === 'Maths' ? <BookOpen size={20} /> : <Atom size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Target Subject</p>
                                        <p className="font-bold text-slate-800 dark:text-white">Class 10 {selectedSubject}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Academic Year</label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                        >
                                            <option value="">Select Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exam Type</label>
                                        <select
                                            name="examType"
                                            value={formData.examType}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                        >
                                            <option value="">Select Type</option>
                                            {examTypes.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* File Drop Area */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload PDF Document</label>
                                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                                            <Upload size={32} />
                                        </div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
                                            {fileName || "Drop your file here"}
                                        </h4>
                                        <p className="text-slate-500 text-sm">{fileName ? "Click to change" : "or click to browse"}</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:translate-y-[-2px] disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><span>Uploading...</span></>
                                    ) : (
                                        <><span>Publish Paper</span> <Upload size={20} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PYQUpload;
