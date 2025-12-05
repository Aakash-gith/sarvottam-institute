import React, { useState, useEffect } from "react";
import { Upload, Trash2, CheckCircle2, AlertCircle, FileText, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

// Helper to map subject name to ID (This should ideally come from backend or a shared config)
const getSubjectId = (subjectName) => {
    const map = {
        "Maths": 1,
        "Science": 2,
        "Physics": 3,
        "Chemistry": 4,
        "Biology": 5,
        "English": 6,
        "Social Science": 7,
        "History": 8,
        "Geography": 9,
        "Civics": 10,
        "Economics": 11
    };
    return map[subjectName] || 1;
};

function NotesUpload() {
    const [formData, setFormData] = useState({
        subject: "",
        class: "",
        title: "",
        description: "",
        file: null,
    });
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [uploadedNotes, setUploadedNotes] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);

    const subjects = ["Maths", "Science", "Physics", "Chemistry", "Biology", "English", "Social Science"];
    const classes = ["9", "10"];

    // Fetch notes when subject/class changes
    useEffect(() => {
        if (formData.subject && formData.class) {
            fetchNotes();
        }
    }, [formData.subject, formData.class]);

    const fetchNotes = async () => {
        if (!formData.subject || !formData.class) return;

        setFetching(true);
        try {
            const subjectId = getSubjectId(formData.subject);
            const response = await API.get(`/subjectNotes/getContent?subjectId=${subjectId}&classId=${formData.class}`);

            if (response.data && response.data.notes) {
                // Sort by newest first
                const sortedNotes = [...response.data.notes].sort((a, b) => {
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                });
                setUploadedNotes(sortedNotes);
            } else {
                setUploadedNotes([]);
            }
        } catch (error) {
            console.error("Failed to fetch notes", error);
            setUploadedNotes([]);
        } finally {
            setFetching(false);
        }
    };

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

        if (!formData.subject || !formData.class || !formData.title || !formData.file) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);

        try {
            // 1. Upload File
            const fileData = new FormData();
            fileData.append("file", formData.file);

            const uploadResponse = await API.post("/subjectNotes/uploadFile", fileData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const fileUrl = uploadResponse.data.fileUrl;

            // 2. Add Note Metadata
            const noteData = {
                subjectId: getSubjectId(formData.subject),
                classId: formData.class,
                title: formData.title,
                description: formData.description,
                fileType: "pdf", // Defaulting to PDF for now
                fileUrl: fileUrl
            };

            await API.post("/subjectNotes/addNote", noteData);

            toast.success("Notes uploaded successfully!");
            fetchNotes(); // Refresh list
            setShowUploadForm(false); // Go back to list

            // Reset form but keep subject/class for easier multiple uploads
            setFormData(prev => ({
                ...prev,
                title: "",
                description: "",
                file: null,
            }));
            setFileName("");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Error uploading notes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        try {
            await API.delete("/subjectNotes/deleteNote", {
                data: {
                    subjectId: getSubjectId(formData.subject),
                    classId: formData.class,
                    noteId: noteId
                }
            });
            toast.success("Note deleted successfully");
            fetchNotes();
        } catch (error) {
            toast.error("Failed to delete note");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Study Notes</h2>
                    <p className="text-gray-500 mt-1">Manage Class Notes & Resources</p>
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

            {/* Subject/Class Filter - Always visible to select context */}
            {!showUploadForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Subject
                        </label>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        >
                            <option value="">Choose Subject...</option>
                            {subjects.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Class
                        </label>
                        <select
                            name="class"
                            value={formData.class}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        >
                            <option value="">Choose Class...</option>
                            {classes.map((c) => (
                                <option key={c} value={c}>
                                    Class {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

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
                        <h3 className="text-lg font-semibold text-gray-900">Upload New Note</h3>
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
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Chapter 5: Quadratic Equations"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Add any additional details about these notes..."
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                ></textarea>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload File <span className="text-red-500">*</span>
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
                                    {loading ? "Uploading..." : "Upload Notes"}
                                    {!loading && <Upload size={20} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                /* Uploaded Notes List */
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-900">
                            {formData.subject && formData.class
                                ? `Uploaded Notes for ${formData.subject} (Class ${formData.class})`
                                : "Select Subject & Class to View Notes"}
                        </h3>
                    </div>

                    {fetching ? (
                        <div className="p-12 text-center">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading notes...</p>
                        </div>
                    ) : uploadedNotes.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {uploadedNotes.map((note) => (
                                <div
                                    key={note._id}
                                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{note.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{note.fileType?.toUpperCase() || "PDF"}</span>
                                                <span>•</span>
                                                <span>Uploaded on {new Date(note.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={note.fileUrl.startsWith("http") ? note.fileUrl : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${note.fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                                        >
                                            View
                                        </a>
                                        <button
                                            onClick={() => handleDelete(note._id)}
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
                                <FileText size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {formData.subject && formData.class
                                    ? "No Notes Found"
                                    : "Ready to View Notes"}
                            </h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                {formData.subject && formData.class
                                    ? "There are no notes uploaded for this subject yet."
                                    : "Please select a subject and class above to view or upload notes."}
                            </p>
                            {formData.subject && formData.class && (
                                <button
                                    onClick={() => setShowUploadForm(true)}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                >
                                    <Plus size={20} />
                                    <span>Upload First Note</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotesUpload;
