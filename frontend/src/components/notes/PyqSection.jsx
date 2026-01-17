import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText } from "lucide-react";
import API from "../../api/axios";

const SUBJECT_META = {
    Maths: {
        title: "Mathematics",
        tagline: "Standard, Basic & language variants",
    },
    Science: {
        title: "Science",
        tagline: "Physics, Chemistry & Biology",
    },
};

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const backendOrigin = apiBase.replace(/\/api\/?$/, "");

const sanitizePath = (filePath = "") =>
    encodeURI(filePath.replace(/^\\+/, "").replace(/^\/+/, ""));

const buildFileUrl = (filePath) => `${backendOrigin}/grade10/${sanitizePath(filePath)}`;

function PyqSection() {
    const [pyqs, setPyqs] = useState({});
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const currentClass = useMemo(() => {
        if (typeof window === "undefined") return 9;
        try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            return userData.class || 9;
        } catch {
            return 9;
        }
    }, []);

    useEffect(() => {
        if (currentClass !== 10) return;

        const fetchPyqs = async () => {
            setStatus("loading");
            try {
                const { data } = await API.get("/pyq");
                setPyqs(data?.subjects || {});
                setStatus("success");
            } catch (error) {
                console.error("Failed to load PYQs", error);
                setErrorMessage(error.response?.data?.message || "Unable to load Board Ready papers.");
                setStatus("error");
            }
        };

        fetchPyqs();
    }, [currentClass]);

    if (currentClass !== 10) {
        return null;
    }

    const renderList = (subjectKey) => {
        const entries = pyqs[subjectKey] || [];

        if (status === "loading") {
            return (
                <li className="text-sm text-gray-500 animate-pulse">Fetching Board Ready content...</li>
            );
        }

        if (status === "error") {
            return (
                <li className="text-sm text-red-500 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errorMessage || "Unable to load Board Ready list right now."}
                </li>
            );
        }

        if (!entries.length) {
            return <li className="text-sm text-gray-500">Question papers will be uploaded soon.</li>;
        }

        return entries.map((item) => (
            <li key={item.label}>
                <a
                    href={buildFileUrl(item.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-100 dark:border-blue-900/20"
                >
                    <FileText size={16} />
                    <span className="truncate">{item.label}</span>
                </a>
            </li>
        ));
    };

    return (
        <section className="bg-white dark:bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-slate-800" id="pyqs">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Board Ready (Past Papers)</h2>
                <p className="text-gray-500 dark:text-slate-400 mt-2">Comprehensive exam preparation with direct access to the latest question papers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Object.keys(SUBJECT_META).map((subjectKey) => (
                    <article className="border border-gray-200 dark:border-slate-800 rounded-xl p-5 bg-gray-50 dark:bg-slate-900/40" data-subject={subjectKey} key={subjectKey}>
                        <header className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{SUBJECT_META[subjectKey].title}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{SUBJECT_META[subjectKey].tagline}</p>
                        </header>
                        <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            <ul className="flex flex-col gap-2">{renderList(subjectKey)}</ul>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default PyqSection;
