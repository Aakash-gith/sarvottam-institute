import React from "react";
import { useNavigate } from "react-router-dom";
import { Atom, Zap, Dna } from "lucide-react";

const BranchSelection = () => {
    const navigate = useNavigate();

    const branches = [
        {
            id: "physics",
            name: "Physics",
            icon: Zap,
            color: "blue", // Tailwind color class naming convention helpers
            desc: "Motion, Force, Electricity & more"
        },
        {
            id: "chemistry",
            name: "Chemistry",
            icon: Atom,
            color: "purple",
            desc: "Reactions, Acids, Bases & more"
        },
        {
            id: "biology",
            name: "Biology",
            icon: Dna,
            color: "emerald",
            desc: "Life Processes, Control & Coordination"
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">Choose Branch</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                {branches.map((branch) => {
                    const Icon = branch.icon;
                    return (
                        <div
                            key={branch.id}
                            onClick={() => navigate(`/video-learning/science/${branch.id}`)}
                            className={`group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 hover:border-${branch.color}-500`}
                        >
                            <div className={`w-14 h-14 rounded-xl bg-${branch.color}-100 dark:bg-${branch.color}-900/30 text-${branch.color}-600 dark:text-${branch.color}-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon size={30} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{branch.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {branch.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BranchSelection;
