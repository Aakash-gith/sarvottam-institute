import React from "react";
import { BookOpen, GraduationCap, Brain } from "lucide-react";

const DashboardLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full bg-transparent p-10 animate-in fade-in duration-700">
            {/* Styles attached directly via a template literal for clean scope */}
            <style>
                {`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-15%); transition-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: none; transition-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2.5s infinite;
                }
                @keyframes loading-bar {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.7); }
                    100% { transform: scaleX(1); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s ease-in-out infinite;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                `}
            </style>

            <div className="relative mb-12">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse"></div>

                {/* Pulsing Central Icon */}
                <div className="relative bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-bounce-slow">
                    <GraduationCap size={80} className="text-primary" />

                    {/* Floating Orbits */}
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent animate-spin-slow">
                        <Brain size={24} />
                    </div>
                    <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                        <BookOpen size={24} />
                    </div>
                </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-4 max-w-sm">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    Preparing your dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-base">
                    Gathering your latest progress and personalizing your learning journey...
                </p>
            </div>

            {/* Progress Bar Animation */}
            <div className="mt-12 w-72 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                <div className="h-full bg-gradient-to-r from-primary via-indigo-500 to-accent animate-loading-bar origin-left rounded-full"></div>
            </div>

            {/* Micro Activity Indicators */}
            <div className="mt-16 flex gap-12 opacity-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="w-12 h-2 bg-slate-100 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="w-12 h-2 bg-slate-100 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLoader;
