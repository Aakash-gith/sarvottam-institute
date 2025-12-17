import React, { useState } from "react";
import { Send, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

function NotificationsManager() {
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        targetAudience: "all",
        class: "",
        priority: "normal",
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.message) {
            toast.error("Title and message are required");
            return;
        }

        setLoading(true);


        try {
            await API.post("/admin/send-notification", formData);

            toast.success("Notification sent successfully!");
            setSent(true);

            setTimeout(() => {
                setFormData({
                    title: "",
                    message: "",
                    targetAudience: "all",
                    class: "",
                    priority: "normal",
                });
                setSent(false);
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Send Notification Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Notification</h2>

                {sent ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                        <CheckCircle2 size={48} className="mx-auto text-green-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Notification Sent!
                        </h3>
                        <p className="text-gray-600">
                            Your notification has been sent to the selected audience.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notification Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., New Study Materials Available"
                                required
                                maxLength="100"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.title.length}/100 characters
                            </p>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Write your notification message here..."
                                required
                                rows="6"
                                maxLength="500"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.message.length}/500 characters
                            </p>
                        </div>

                        {/* Target Audience */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Audience <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="targetAudience"
                                    value={formData.targetAudience}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Students</option>
                                    <option value="class">Specific Class</option>
                                </select>
                            </div>

                            {/* Class (if specific) */}
                            {formData.targetAudience === "class" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Class <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="class"
                                        value={formData.class}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Class</option>
                                        <option value="9">Class 9</option>
                                        <option value="10">Class 10</option>
                                    </select>
                                </div>
                            )}

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority Level
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                            <div className="bg-white border border-blue-300 rounded p-4">
                                <p className="font-bold text-gray-900">{formData.title || "Notification Title"}</p>
                                <p className="text-gray-600 text-sm mt-2">
                                    {formData.message || "Notification message will appear here"}
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? "Sending..." : "Send Notification"}
                            {!loading && <Send size={20} />}
                        </button>
                    </form>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex gap-4">
                    <AlertCircle size={24} className="text-blue-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Notification Tips</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>✓ Use clear and concise titles</li>
                            <li>✓ Keep messages engaging and informative</li>
                            <li>✓ Set appropriate priority levels</li>
                            <li>✓ Target specific classes for relevant notifications</li>
                            <li>✓ Avoid sending too many notifications</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Notifications</h2>
                <div className="text-center py-8 text-gray-500">
                    <Users size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No notifications sent yet</p>
                </div>
            </div>
        </div>
    );
}

export default NotificationsManager;
