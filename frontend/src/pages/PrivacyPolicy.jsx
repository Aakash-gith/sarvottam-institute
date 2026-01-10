import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background py-16 px-4 md:px-8">
            <Helmet>
                <title>Privacy Policy | Sarvottam Institute</title>
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
                    Privacy Policy
                </h1>

                <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Sarvottam Institute. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at sarvottamcoachingcentre1@gmail.com.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">2. Information We Collect</h2>
                        <p>
                            We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information.
                        </p>
                        <ul className="list-disc ml-6 mt-4 space-y-2">
                            <li><strong>Account Data:</strong> We collect your name, email address, and phone number when you register for our services.</li>
                            <li><strong>Payment Data:</strong> We collect data necessary to process your payment if you make purchases, such as your payment instrument number (handled securely via Razorpay).</li>
                            <li><strong>Academic Data:</strong> We store your progress, quiz scores, and learning history to provide personalized feedback.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">3. How We Use Your Information</h2>
                        <p>
                            We use personal information collected via our Services for a variety of business purposes described below:
                        </p>
                        <ul className="list-disc ml-6 mt-4 space-y-2">
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send you marketing and promotional communications related to Sarvottam Institute.</li>
                            <li>To fulfill and manage your orders and subscription.</li>
                            <li>To improve our educational content based on user interaction.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">4. Sharing Your Information</h2>
                        <p>
                            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. This includes our payment processor, Razorpay.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">5. Contact Us</h2>
                        <p>
                            If you have questions or comments about this policy, you may email us at sarvottamcoachingcentre1@gmail.com or visit us at Ghaziabad, Uttar Pradesh.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
