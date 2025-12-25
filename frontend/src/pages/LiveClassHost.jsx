
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HMSPrebuilt } from "@100mslive/roomkit-react";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function LiveClassHost() {
    const { classId } = useParams();
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // Fetch token specifically for HOST role
                // Backend should verify admin privileges before giving host token
                const response = await API.get(`/live-classes/${classId}/join?role=teacher`);
                if (response.data && response.data.token) {
                    setToken(response.data.token);
                } else {
                    toast.error("Could not generate token");
                    navigate("/admin/dashboard");
                }
            } catch (error) {
                console.error("Failed to join class:", error);
                toast.error("Failed to join class. Ensure you are an instructor.");
                navigate("/admin/dashboard");
            } finally {
                setLoading(false);
            }
        };

        if (classId) {
            fetchToken();
        }
    }, [classId, navigate]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
                <Loader2 className="animate-spin" size={48} />
                <span className="ml-4 text-xl font-medium">Preparing Studio...</span>
            </div>
        );
    }

    if (!token) return null;

    return (
        <div style={{ height: "100vh", width: "100vw" }}>
            <HMSPrebuilt roomCode={token} />
        </div>
    );
}
