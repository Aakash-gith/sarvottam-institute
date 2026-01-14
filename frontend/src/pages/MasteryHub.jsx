import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getMasterySets } from "../api/mastery";
import {
    Zap,
    Search,
    LayoutGrid,
    List,
    BookOpen,
    ArrowRight,
    Plus,
    Play,
    Clock,
    Trophy,
    X,
    Sparkles,
    Trash2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { generateCards, createMasterySet, deleteMasterySet } from "../api/mastery";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MasteryHub = () => {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSubject, setActiveSubject] = useState(0); // 0: All, 1: Maths, 2: Science
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

    const navigate = useNavigate();
    const location = useLocation();
    const { userData } = useSelector((state) => state.auth);
    const currentClass = userData?.class || 9;

    // AI Modal State
    const [showAiModal, setShowAiModal] = useState(false);
    const [topic, setTopic] = useState("");
    const [textContent, setTextContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null); // { cards, summary, keyQuestions }

    const fetchHtmlContent = async (url) => {
        try {
            const res = await fetch(url);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const scripts = doc.querySelectorAll('script, style');
            scripts.forEach(s => s.remove());
            const text = doc.body.innerText || doc.body.textContent;
            setTextContent(text);
        } catch (error) {
            console.error("Error fetching HTML content:", error);
        }
    };

    useEffect(() => {
        if (location.state?.generateFor) {
            setTopic(location.state.generateFor);
            setShowAiModal(true);

            if (location.state.fileUrl && location.state.fileUrl.endsWith('.html')) {
                fetchHtmlContent(location.state.fileUrl);
            }

            // Clear state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        fetchSets();
    }, [activeSubject, currentClass]);

    const fetchSets = async () => {
        setLoading(true);
        try {
            // Mapping subject ids for query
            let subjectId = activeSubject === 0 ? undefined : activeSubject;
            // Handle sub-subjects for science if needed, but for hub we keep it simple
            const res = await getMasterySets(subjectId, currentClass);
            if (res.success) {
                setSets(res.data);
            }
        } catch (error) {
            console.error("Error fetching sets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);
        try {
            const res = await generateCards({ topic, textContent, count: 12 });
            if (res.success) {
                setGeneratedContent(res.data);
            }
        } catch (error) {
            toast.error("AI Generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveSet = async () => {
        try {
            const res = await createMasterySet({
                title: topic,
                description: `AI Generated set for ${topic}`,
                subjectId: activeSubject || 1,
                classId: currentClass,
                cards: generatedContent.cards,
                summary: generatedContent.summary,
                keyQuestions: generatedContent.keyQuestions
            });
            if (res.success) {
                toast.success("Mastery Set Created!");
                setShowAiModal(false);
                fetchSets();
            }
        } catch (error) {
            toast.error("Failed to save set");
        }
    };

    const handleDeleteSet = async (e, setId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this mastery set?")) {
            try {
                const res = await deleteMasterySet(setId);
                if (res.success) {
                    toast.success("Set deleted successfully");
                    fetchSets();
                }
            } catch (error) {
                toast.error("Failed to delete set");
                console.error(error);
            }
        }
    };

    const filteredSets = sets.filter(set =>
        set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 ml-0 md:ml-[120px] pt-16 md:pt-0">
                <main className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">

                    {/* Header Section */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123b70] to-[#0fb4b3] p-8 md:p-12 text-white shadow-2xl">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                                    <Zap className="text-amber-400 fill-amber-400" size={24} />
                                </div>
                                <span className="text-white/80 font-medium tracking-wider uppercase text-xs">Learning Ecosystem</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                                Sarvottam <span className="text-amber-300">Mastery Hub</span>
                            </h1>
                            <p className="text-white/90 text-sm md:text-lg max-w-2xl font-light leading-relaxed">
                                Elevate your understanding with AI-powered flashcards, timed challenges, and adaptive learning paths specifically for Class {currentClass}.
                            </p>

                            <div className="flex flex-wrap gap-4 mt-8">
                                <button
                                    onClick={() => navigate('/notes')}
                                    className="bg-white text-[#123b70] px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                >
                                    <BookOpen size={20} />
                                    Go to Notes
                                </button>
                                <button
                                    onClick={() => {
                                        setTopic("");
                                        setTextContent("");
                                        setGeneratedContent(null);
                                        setShowAiModal(true);
                                    }}
                                    className="bg-amber-400 text-[#123b70] px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Sparkles size={20} className="fill-[#123b70]" />
                                    Create with AI
                                </button>
                            </div>
                        </div>

                        {/* Abstract Background Design */}
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#f4c542]/20 rounded-full blur-3xl" />
                    </div>

                    {/* Controls Section */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-card p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        {/* Subject Filters */}
                        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl self-start md:self-auto">
                            <button
                                onClick={() => setActiveSubject(0)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubject === 0 ? 'bg-white dark:bg-[#123b70] shadow-md text-[#123b70] dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                            >
                                All Subjects
                            </button>
                            <button
                                onClick={() => setActiveSubject(1)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubject === 1 ? 'bg-white dark:bg-[#123b70] shadow-md text-[#123b70] dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                            >
                                Mathematics
                            </button>
                            <button
                                onClick={() => setActiveSubject(2)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubject === 2 ? 'bg-white dark:bg-[#123b70] shadow-md text-[#123b70] dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                            >
                                Science
                            </button>
                        </div>

                        {/* Search & View Mode */}
                        <div className="flex gap-4 w-full md:w-auto items-center">
                            <div className="relative flex-1 md:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search sets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 border-none focus:ring-2 focus:ring-[#0fb4b3] text-sm text-slate-900 dark:text-white transition-all"
                                />
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-[#123b70] shadow-sm text-[#123b70] dark:text-white' : 'text-slate-400'}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-[#123b70] shadow-sm text-[#123b70] dark:text-white' : 'text-slate-400'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sets Display */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-900/50 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredSets.length > 0 ? (
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            : "flex flex-col gap-4"
                        }>
                            {filteredSets.map(set => (
                                <div
                                    key={set._id}
                                    onClick={() => navigate(`/mastery-hub/set/${set._id}`)}
                                    className={`group relative bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'flex p-2' : ''}`}
                                >
                                    {/* Card Content */}
                                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${set.subjectId % 2 === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                                                {set.subjectId % 2 === 1 ? "Maths" : "Science"}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <Clock size={14} />
                                                    {set.cards?.length || 0} CARDS
                                                </div>
                                                {(userData?._id === set.createdBy || userData?.role === 'admin') && (
                                                    <button
                                                        onClick={(e) => handleDeleteSet(e, set._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete Set"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold mb-2 text-[#123b70] dark:text-white group-hover:text-[#0fb4b3] transition-colors line-clamp-1">{set.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
                                            {set.description || "Master the concepts with interactive study modes."}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#123b70] flex items-center justify-center text-[10px] text-white font-bold">
                                                    {set.createdBy?.name?.charAt(0) || "S"}
                                                </div>
                                                <span className="text-xs font-medium text-slate-400">Sarvottam Official</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[#0fb4b3] font-bold text-sm">
                                                Study Now
                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Indicator for Grid View */}
                                    {viewMode === 'grid' && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <Trophy size={20} className="text-slate-200" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
                                <Search className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No Mastery Sets Found</h3>
                            <p className="text-slate-500 max-w-sm mb-8">
                                We couldn't find any study sets matching your filters. Stay tuned as our teachers add more daily!
                            </p>
                        </div>
                    )}

                    {/* Quick Create CTA (For demonstration) */}
                    <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
                        <div className="relative z-10 flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3 italic">Can't find what you need?</h2>
                            <p className="text-slate-400">Generate your own custom Mastery Set for any topic in seconds using AI.</p>
                        </div>
                        <button
                            onClick={() => {
                                setTopic("");
                                setTextContent("");
                                setGeneratedContent(null);
                                setShowAiModal(true);
                            }}
                            className="relative z-10 whitespace-nowrap bg-[#0fb4b3] px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-[#0fb4b3]/20"
                        >
                            <Sparkles size={20} className="fill-white" />
                            Create New Set
                        </button>

                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0fb4b3]/10 blur-3xl rounded-full" />
                    </div>

                </main>
            </div>

            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAiModal(false)} />
                    <div className="relative bg-white dark:bg-card w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                    <Zap className="text-amber-500 fill-amber-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-[#123b70] dark:text-white">AI Mastery Creator</h2>
                            </div>

                            {!generatedContent ? (
                                <div className="flex flex-col gap-6">
                                    <p className="text-slate-500 dark:text-slate-300 font-medium text-sm">
                                        We'll use AI to create a complete study set including <b>Flashcards</b>, <b>Revision Notes</b>, and <b>Expert Q&A</b>.
                                    </p>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setActiveSubject(1)}
                                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeSubject === 1 ? 'bg-[#123b70] text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900/50 text-slate-500'}`}
                                            >
                                                Mathematics
                                            </button>
                                            <button
                                                onClick={() => setActiveSubject(2)}
                                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeSubject === 2 ? 'bg-[#123b70] text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900/50 text-slate-500'}`}
                                            >
                                                Science
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Topic / Chapter Name</label>
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-none focus:ring-2 focus:ring-[#0fb4b3] font-bold text-slate-900 dark:text-white"
                                            placeholder="e.g. Chemical Reactions and Equations"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !topic}
                                        className="w-full py-4 bg-[#123b70] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl disabled:opacity-50 transition-all"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Generating Complete Set...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={20} className="fill-white" />
                                                Generate Mastery Set
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <p className="text-slate-500 dark:text-slate-300 font-medium text-sm">
                                            AI has generated your study resources.
                                        </p>
                                    </div>

                                    <div className="max-h-[350px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">Flashcards ({generatedContent.cards?.length})</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {generatedContent.cards?.slice(0, 4).map((card, i) => (
                                                    <div key={i} className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-200">
                                                        <b>{card.term}</b>
                                                    </div>
                                                ))}
                                                {generatedContent.cards?.length > 4 && <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center pl-2">+{generatedContent.cards.length - 4} more...</div>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">Revision Notes</h4>
                                            <div className="p-3 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20 text-xs text-slate-600 dark:text-slate-200 line-clamp-3 italic prose prose-slate dark:prose-invert prose-xs">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {generatedContent.summary}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">Expert Q&A</h4>
                                            <div className="space-y-2">
                                                {generatedContent.keyQuestions?.slice(0, 2).map((q, i) => (
                                                    <div key={i} className="text-[11px] text-slate-500 dark:text-slate-300">
                                                        <b>Q:</b> {q.question}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={() => setGeneratedContent(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-900/50 text-slate-600 rounded-2xl font-bold">Try Again</button>
                                        <button onClick={handleSaveSet} className="flex-1 py-4 bg-[#0fb4b3] text-white rounded-2xl font-bold shadow-lg shadow-[#0fb4b3]/30">Save Set</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setShowAiModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-red-500"><X size={24} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasteryHub;
