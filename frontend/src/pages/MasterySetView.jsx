import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getMasterySetById, updateCardStatus, updateMatchTime } from "../api/mastery";
import {
    ArrowLeft,
    RotateCcw,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Dices,
    Info,
    Zap,
    Play
} from "lucide-react";
import toast from "react-hot-toast";

const MasterySetView = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const [set, setSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [mode, setMode] = useState("flashcards"); // 'flashcards', 'learn', 'match'

    useEffect(() => {
        fetchSet();
    }, [setId]);

    const fetchSet = async () => {
        try {
            const res = await getMasterySetById(setId);
            if (res.success) {
                setSet(res.data);
            }
        } catch (error) {
            toast.error("Failed to load set");
            navigate("/mastery-hub");
        } finally {
            setLoading(false);
        }
    };

    const currentCard = set?.cards[currentCardIndex];

    const handleNext = () => {
        setIsFlipped(false);
        if (currentCardIndex < set.cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            setCurrentCardIndex(0);
        }
    };

    const handlePrev = () => {
        setIsFlipped(false);
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        } else {
            setCurrentCardIndex(set.cards.length - 1);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            const res = await updateCardStatus(setId, currentCardIndex, status);
            if (res.success) {
                setSet(prev => ({
                    ...prev,
                    userProgress: res.data
                }));
                handleNext();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="loader"></div></div>;
    if (!set) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Sidebar />

            <div className="flex-1 ml-0 md:ml-[120px] pt-16 md:pt-0">
                <main className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">

                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/mastery-hub")}
                            className="flex items-center gap-2 text-slate-500 hover:text-[#123b70] font-bold transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Mastery Hub
                        </button>
                        <div className="flex items-center gap-4">
                            {set.userProgress?.bestMatchTime && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <Trophy size={16} className="text-amber-500" />
                                    <span className="text-xs font-bold text-amber-600">{(set.userProgress.bestMatchTime / 1000).toFixed(2)}s Record</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#123b70] dark:text-white">{set.title}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{set.description}</p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl w-full max-w-md">
                        <button
                            onClick={() => setMode('flashcards')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'flashcards' ? 'bg-white dark:bg-[#123b70] shadow-md text-[#123b70] dark:text-white' : 'text-slate-500'}`}
                        >
                            <RotateCcw size={16} />
                            Flashcards
                        </button>
                        <button
                            onClick={() => setMode('learn')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'learn' ? 'bg-white dark:bg-[#123b70] shadow-md text-[#123b70] dark:text-white' : 'text-slate-500'}`}
                        >
                            <Play size={16} />
                            Learn
                        </button>
                        <button
                            onClick={() => setMode('match')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'match' ? 'bg-white dark:bg-[#123b70] shadow-md text-[#123b70] dark:text-white' : 'text-slate-500'}`}
                        >
                            <Zap size={16} />
                            Match
                        </button>
                    </div>

                    {/* Rendering Modes */}
                    {mode === 'flashcards' && (
                        <div className="flex flex-col items-center gap-8 py-8 animate-in fade-in duration-500">
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#0fb4b3] to-[#123b70] transition-all duration-300"
                                    style={{ width: `${((currentCardIndex + 1) / set.cards.length) * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Progress</span>
                                <span>{currentCardIndex + 1} / {set.cards.length} Cards</span>
                            </div>

                            {/* 3D Flashcard */}
                            <div
                                className="perspective-1000 w-full max-w-2xl h-80 md:h-[400px] cursor-pointer"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <div className={`relative w-full h-full text-center transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    {/* Front Side */}
                                    <div className="absolute w-full h-full backface-hidden bg-white dark:bg-card border-2 border-[#123b70]/10 rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 md:p-12">
                                        <span className="absolute top-8 left-8 text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.3em]">Question/Term</span>
                                        <h2 className="text-2xl md:text-4xl font-black text-[#123b70] dark:text-white leading-tight">
                                            {currentCard.term}
                                        </h2>
                                        <div className="absolute bottom-8 text-xs font-bold text-[#0fb4b3] animate-bounce">
                                            Tap to flip
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-[#123b70] to-[#0f1f3c] rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 text-white">
                                        <span className="absolute top-8 left-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Answer/Definition</span>
                                        <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                            {currentCard.definition}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                    className="p-4 bg-white dark:bg-card rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all text-[#123b70] dark:text-white"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <div className="flex gap-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate('struggling'); }}
                                        className="px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-100 transition-colors"
                                    >
                                        <X size={20} />
                                        Still Learning
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate('known'); }}
                                        className="px-6 py-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                                    >
                                        <Check size={20} />
                                        Mastered
                                    </button>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="p-4 bg-white dark:bg-card rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all text-[#123b70] dark:text-white"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'match' && <MatchGame cards={set.cards} setId={setId} onFinish={fetchSet} />}
                    {mode === 'learn' && <LearnMode cards={set.cards} setId={setId} />}

                </main>
            </div>
        </div>
    );
};

// --- Sub-Components (Internal for now) ---

const MatchGame = ({ cards, setId, onFinish }) => {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [matches, setMatches] = useState([]);
    const [wrong, setWrong] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        // Shuffle and pick 6 random cards
        const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 6);
        const gameItems = [];
        shuffled.forEach((card, idx) => {
            gameItems.push({ id: `term-${idx}`, content: card.term, type: 'term', matchId: idx });
            gameItems.push({ id: `def-${idx}`, content: card.definition, type: 'definition', matchId: idx });
        });
        setItems(gameItems.sort(() => Math.random() - 0.5));
        setStartTime(Date.now());
    }, [cards]);

    useEffect(() => {
        let interval;
        if (startTime && !endTime) {
            interval = setInterval(() => {
                setTimer(Date.now() - startTime);
            }, 10);
        }
        return () => clearInterval(interval);
    }, [startTime, endTime]);

    const handleSelect = async (item) => {
        if (matches.includes(item.id) || selected?.id === item.id) return;

        if (!selected) {
            setSelected(item);
        } else {
            // Check for match
            if (selected.matchId === item.matchId && selected.type !== item.type) {
                setMatches(prev => [...prev, selected.id, item.id]);
                setSelected(null);

                // Check game win
                if (matches.length + 2 === items.length) {
                    const finishedTime = Date.now() - startTime;
                    setEndTime(finishedTime);
                    try {
                        await updateMatchTime(setId, finishedTime);
                        onFinish();
                    } catch (e) { }
                }
            } else {
                setWrong([selected.id, item.id]);
                setSelected(null);
                setTimeout(() => setWrong(null), 500);
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 py-4 animate-in zoom-in duration-300">
            <div className="text-3xl font-black text-[#123b70] dark:text-white tabular-nums">
                {(timer / 1000).toFixed(2)}s
            </div>

            {!endTime ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={`
                h-32 p-4 rounded-2xl flex items-center justify-center text-center text-sm font-bold cursor-pointer transition-all duration-200 border-2
                ${matches.includes(item.id) ? 'opacity-0 scale-90 pointer-events-none' : ''}
                ${selected?.id === item.id ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-xl' : 'bg-white dark:bg-card text-slate-700 dark:text-white border-slate-100 dark:border-slate-800 hover:border-[#0fb4b3]'}
                ${wrong?.includes(item.id) ? 'bg-red-500 text-white border-red-500 animate-shake' : ''}
              `}
                        >
                            {item.content}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 py-12">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                        <Trophy size={48} className="text-amber-500" />
                    </div>
                    <h2 className="text-4xl font-black text-[#123b70] dark:text-white">Great Work!</h2>
                    <p className="text-slate-500 font-bold">You matched all items in <span className="text-[#0fb4b3]">{(endTime / 1000).toFixed(2)}</span> seconds.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-[#123b70] text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

const LearnMode = ({ cards, setId }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [options, setOptions] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (cards && cards[currentIdx]) {
            setupQuestion();
        }
    }, [currentIdx, cards]);

    const setupQuestion = () => {
        setSelectedIdx(null);
        setIsCorrect(null);
        const correct = cards[currentIdx];
        const others = cards.filter((_, i) => i !== currentIdx).sort(() => Math.random() - 0.5).slice(0, 3);
        const all = [...others, correct].sort(() => Math.random() - 0.5);
        setOptions(all);
    };

    const handleAnswer = (option, idx) => {
        if (selectedIdx !== null) return;

        setSelectedIdx(idx);
        const correct = option.term === cards[currentIdx].term;
        setIsCorrect(correct);
        if (correct) setScore(s => s + 1);

        setTimeout(() => {
            if (currentIdx < cards.length - 1) {
                setCurrentIdx(prev => prev + 1);
            } else {
                setFinished(true);
            }
        }, 1500);
    };

    if (finished) {
        return (
            <div className="flex flex-col items-center gap-6 py-12 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-3xl font-black">Learn Complete!</h2>
                <p className="text-slate-500">You scored <span className="text-[#0fb4b3] font-bold">{score} / {cards.length}</span></p>
                <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-[#0fb4b3]" style={{ width: `${(score / cards.length) * 100}%` }} />
                </div>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#123b70] text-white rounded-2xl font-bold">Try Again</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Definition</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{cards[currentIdx].definition}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(opt, i)}
                        className={`
                 p-6 rounded-2xl border-2 text-left transition-all duration-200 font-bold
                 ${selectedIdx === null ? 'bg-white dark:bg-card border-slate-100 dark:border-slate-800 hover:border-[#0fb4b3] hover:shadow-lg' : ''}
                 ${selectedIdx === i && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                 ${selectedIdx === i && !isCorrect ? 'bg-red-500 border-red-500 text-white' : ''}
                 ${selectedIdx !== null && opt.term === cards[currentIdx].term && !isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                 ${selectedIdx !== null && selectedIdx !== i && !(opt.term === cards[currentIdx].term) ? 'opacity-50' : ''}
               `}
                    >
                        <span className="text-xs mr-3 opacity-50">{String.fromCharCode(65 + i)}</span>
                        {opt.term}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MasterySetView;
