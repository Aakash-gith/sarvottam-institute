import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { privacyPolicy, termsOfService, refundPolicy } from '../Routes/Routes';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-card border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-2 lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Sarvottam Logo" className="w-10 h-10 object-contain rounded-full bg-white" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Sarvottam Institute
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Empowering students of Grades 9 & 10 with premium study materials, AI-powered assessments, and a high-performance learning environment.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://www.facebook.com/profile.php?id=100069589076022" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted text-slate-600 dark:text-slate-400 hover:bg-[#1877F2] hover:text-white rounded-lg transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.instagram.com/sarvottam_institute/" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted text-slate-600 dark:text-slate-400 hover:bg-[#E4405F] hover:text-white rounded-lg transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.youtube.com/@SarvottamInstitute" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted text-slate-600 dark:text-slate-400 hover:bg-[#FF0000] hover:text-white rounded-lg transition-all duration-300">
                                <Youtube size={18} />
                            </a>
                            <a href="#" className="p-2 bg-muted text-slate-600 dark:text-slate-400 hover:bg-black hover:text-white rounded-lg transition-all duration-300">
                                <X size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h4 className="text-foreground font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><a href="/" className="text-muted-foreground hover:text-primary text-sm transition-colors">Home</a></li>
                            <li><a href="/courses" className="text-muted-foreground hover:text-primary text-sm transition-colors">All Courses</a></li>
                            <li><a href="/auth/signup" className="text-muted-foreground hover:text-primary text-sm transition-colors">Get Started</a></li>
                            <li><a href="/auth/login" className="text-muted-foreground hover:text-primary text-sm transition-colors">Student Login</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="col-span-1">
                        <h4 className="text-foreground font-bold mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Study Materials</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Previous Year Papers</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Sample Quizzes</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Learning Guide</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-2 lg:col-span-1">
                        <h4 className="text-foreground font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                <span className="text-muted-foreground text-sm">Ghaziabad, Uttar Pradesh, India</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-primary shrink-0" />
                                <span className="text-muted-foreground text-sm">+91 97119 84700</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-primary shrink-0" />
                                <span className="text-muted-foreground text-sm">sarvottamcoachingcentre1@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted-foreground text-xs">
                        © 2022 Sarvottam Institute. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to={privacyPolicy} className="text-muted-foreground hover:text-primary text-xs transition-colors">Privacy Policy</Link>
                        <Link to={termsOfService} className="text-muted-foreground hover:text-primary text-xs transition-colors">Terms of Service</Link>
                        <Link to={refundPolicy} className="text-muted-foreground hover:text-primary text-xs transition-colors">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
