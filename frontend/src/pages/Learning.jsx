import React from "react";

import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, ChevronRight } from "lucide-react";

function Learning() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 transition-all duration-300 ml-[120px]">
                <div className="p-6 md:p-10 rounded-lg gap-5 flex flex-col h-full overflow-auto">

                    <div className="max-w-4xl mx-auto w-full">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Learning Center</h1>
                            <p className="text-gray-600 text-lg">Welcome to the learning section of Sarvottam Institute!</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                onClick={() => navigate('/notes')}
                                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <BookOpen size={28} className="text-white" />
                                    </div>
                                    <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Study Materials</h3>
                                <p className="text-gray-600 mb-6">Access comprehensive learning resources for Class 9 and 10</p>
                                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    Browse Materials
                                </button>
                            </div>

                            <div
                                onClick={() => navigate('/notes')}
                                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                        <TrendingUp size={28} className="text-white" />
                                    </div>
                                    <ChevronRight size={24} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Progress Tracking</h3>
                                <p className="text-gray-600 mb-6">Monitor your learning journey and track your achievements</p>
                                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    View Progress
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Learning;