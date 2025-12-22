import React from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, FlaskConical } from "lucide-react";

const SubjectSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-3xl font-bold mb-12 text-center dark:text-white">Choose Your Subject</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Maths Card */}
                <div
                    onClick={() => navigate("/video-learning/maths")}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <Calculator size={150} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Calculator size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mathematics</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center">
                            Master concepts from Real Numbers to Probability with expert video lectures.
                        </p>
                    </div>
                </div>

                {/* Science Card */}
                <div
                    onClick={() => navigate("/video-learning/science")}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <FlaskConical size={150} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FlaskConical size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Science</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center">
                            Explore Physics, Chemistry, and Biology through interactive video lessons.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectSelection;
