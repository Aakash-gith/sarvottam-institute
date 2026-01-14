import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { updateUser } from '../store/authSlice';
import { Sun, Moon } from 'lucide-react';
import API from '../api/axios';

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);
    const { status } = useSelector((state) => state.auth);

    const handleToggle = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        dispatch(toggleTheme());
        dispatch(updateUser({ theme: newTheme }));

        // Sync with backend if logged in
        if (status) {
            try {
                await API.put('/user/update-theme', { theme: newTheme });
            } catch (error) {
                console.error("Failed to sync theme preference:", error);
            }
        }
    };

    return (
        <button
            onClick={handleToggle}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--background)] dark:focus:ring-offset-[var(--background)]"
            aria-label="Toggle Theme"
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
            )}
        </button>
    );
};

export default ThemeToggle;
