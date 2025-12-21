import React from "react";
import Sidebar from "../components/Sidebar";

function Books() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 transition-all duration-300 ml-[120px] p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Reference Books</h1>
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                    <div className="text-6xl mb-4">📖</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
                    <p className="text-gray-500">Access to digital versions of important reference books.</p>
                </div>
            </div>
        </div>
    );
}

export default Books;
