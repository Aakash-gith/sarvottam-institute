import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background py-16 px-4 md:px-8">
            <Helmet>
                <title>Refund Policy | Sarvottam Institute</title>
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
                    Refund Policy
                </h1>

                <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">1. General Policy</h2>
                        <p>
                            At Sarvottam Institute, we strive to provide the highest quality educational content. Due to the digital nature of our products (Videos, Notes, and Online Quizzes), we generally do not offer refunds once access has been granted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">2. Exceptions</h2>
                        <p>
                            Refunds may be considered under the following circumstances:
                        </p>
                        <ul className="list-disc ml-6 mt-4 space-y-2">
                            <li><strong>Duplicate Payment:</strong> If you have been charged twice for the same course by mistake.</li>
                            <li><strong>Technical Failure:</strong> If you are unable to access the content due to a fundamental technical error on our side that we cannot resolve within 7 business days.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">3. Refund Process</h2>
                        <p>
                            To request a refund, please email sarvottamcoachingcentre1@gmail.com with your transaction ID, registered email, and the reason for your request. All valid refund requests are processed within 5-10 business days through our payment partner, Razorpay.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">4. Cancellations</h2>
                        <p>
                            You may cancel your subscription at any time; however, cancellations do not entitle you to a refund for the already paid period. You will continue to have access to the service until the end of your billing cycle.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
