import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
