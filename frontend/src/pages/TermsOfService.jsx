import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background py-16 px-4 md:px-8">
            <Helmet>
                <title>Terms of Service | Sarvottam Institute</title>
            </Helmet>
            <div className="max-w-4xl mx-auto bg-card p-8 md:p-12 rounded-[32px] shadow-xl border border-border">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-primary hover:text-accent transition-colors font-bold text-sm group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 border-b pb-6 border-slate-100 dark:border-slate-800">
                    Terms of Service
                </h1>

                <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Sarvottam Institute (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">2. Use of Service</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>You must be at least 13 years old to use this Service.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You agree not to share your paid account access with others.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">3. Premium Content & Payments</h2>
                        <p>
                            Certain features of our Service require payment. All payments are processed through Razorpay. You agree to provide accurate payment information and authorize us to charge the specified fees.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">4. Intellectual Property</h2>
                        <p>
                            All content provided on Sarvottam Institute, including videos, notes, and quizzes, is the property of Sarvottam Institute and protected by copyright laws. You may not distribute, modify, or reproduce our content without express written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">5. Termination</h2>
                        <p>
                            We reserve the right to terminate or suspend your account if you violate these terms or engage in fraudulent activities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">6. Changes to Terms</h2>
                        <p>
                            We may update these terms from time to time. Your continued use of the Service after changes are posted constitutes your acceptance of the new terms.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
