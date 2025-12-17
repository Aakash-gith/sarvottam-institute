import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTES_DIR = path.resolve(__dirname, '../../grade10/notes');

// Premium CSS Content (Styles Only - Root vars are injected dynamically)
const PREMIUM_CSS_STYLES = `
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: radial-gradient(circle at top left, #1e293b, #020617 50%, #000);
        color: var(--text-main);
        line-height: 1.6;
        min-height: 100vh;
        scroll-behavior: smooth;
    }

    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    /* Layout */
    .page {
        max-width: 1120px;
        margin: 0 auto;
        padding: 1.5rem 1.25rem 3rem;
    }

    header {
        position: sticky;
        top: 0;
        z-index: 50;
        backdrop-filter: blur(14px);
        background: linear-gradient(to right, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.9));
        border-bottom: 1px solid rgba(55, 65, 81, 0.5);
    }

    .nav-inner {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0.7rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-size: 0.85rem;
        color: #e5e7eb;
    }

    .logo-badge {
        width: 26px;
        height: 26px;
        border-radius: 12px;
        background: radial-gradient(circle at 20% 20%, #34d399, var(--accent) 60%, var(--accent-strong));
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        color: #fff;
        font-weight: 800;
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    .nav-links {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .nav-links a {
        font-size: 0.78rem;
        padding: 0.35rem 0.8rem;
        border-radius: var(--radius-pill);
        border: 1px solid transparent;
        color: var(--text-soft);
        transition: all var(--transition-fast);
    }

    .nav-links a:hover {
        background: rgba(31, 41, 55, 0.85);
        border-color: rgba(55, 65, 81, 0.9);
        color: #e5e7eb;
        transform: translateY(-1px);
    }

    .nav-links a.primary-link {
        border-color: rgba(var(--accent-rgb), 0.7);
        background: linear-gradient(135deg, var(--accent-soft), rgba(var(--accent-rgb), 0.1));
        color: #fff;
    }

    .nav-links a.primary-link:hover {
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        color: #fff;
        border-color: transparent;
        box-shadow: 0 15px 40px var(--accent-soft);
    }

    /* Hero */
    .hero {
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 2.4fr);
        gap: 2.5rem;
        align-items: center;
        margin-top: 2.3rem;
        margin-bottom: 3rem;
    }

    .hero-text h1 {
        font-size: clamp(2.1rem, 3vw + 1.2rem, 3.2rem);
        line-height: 1.1;
        margin-bottom: 0.75rem;
    }

    .hero-subtitle {
        font-size: 0.98rem;
        color: var(--text-soft);
        max-width: 33rem;
        margin-bottom: 1.4rem;
    }

    .badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-bottom: 1.4rem;
    }

    .badge {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.09em;
        padding: 0.3rem 0.8rem;
        border-radius: var(--radius-pill);
        border: 1px solid rgba(148, 163, 184, 0.5);
        color: #cbd5f5;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }

    .badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--accent);
        box-shadow: 0 0 0 4px var(--accent-soft);
    }

    .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.6rem 1.4rem;
        border-radius: var(--radius-pill);
        font-weight: 600;
        font-size: 0.9rem;
        transition: all var(--transition-med);
        cursor: pointer;
    }

    .btn-primary {
        background: var(--accent);
        color: #fff;
        border: 1px solid transparent;
        box-shadow: 0 4px 15px var(--accent-soft);
    }

    .btn-primary:hover {
        background: var(--accent-strong);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px var(--accent-soft);
    }

    .btn-secondary {
        background: rgba(31, 41, 55, 0.6);
        color: #e5e7eb;
        border: 1px solid rgba(75, 85, 99, 0.5);
    }

    .btn-secondary:hover {
        background: rgba(55, 65, 81, 0.8);
        border-color: #9ca3af;
        transform: translateY(-2px);
    }

    .hero-visual { position: relative; }

    .hero-card {
        background: var(--card-bg);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-xl);
        padding: 1.5rem;
        box-shadow: var(--shadow-soft);
        position: relative;
        overflow: hidden;
    }

    .hero-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to right, #34d399, var(--accent));
    }

    .diagram-placeholder {
        width: 100%;
        aspect-ratio: 16/9;
        background: #0f172a;
        border-radius: var(--radius-lg);
        border: 1px dashed #334155;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        font-size: 0.85rem;
        margin-bottom: 1rem;
        overflow: hidden;
    }
    
    .diagram-placeholder img { width: 100%; height: 100%; object-fit: cover; }
    .diagram-placeholder.fit-contain img { object-fit: contain; }

    /* Sections */
    section { margin-bottom: 5rem; scroll-margin-top: 6rem; }
    
    .section-label {
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        color: var(--accent);
        margin-bottom: 0.5rem;
        font-weight: 700;
    }

    .section-title-row { margin-bottom: 2rem; }
    h2 { font-size: 2rem; margin-bottom: 0.5rem; color: #f1f5f9; }
    .section-hint { color: var(--text-soft); font-size: 1rem; max-width: 38rem; }

    /* Cards & Grid */
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }

    .card {
        background: rgba(17, 24, 39, 0.6);
        border: 1px solid rgba(31, 41, 55, 0.6);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        transition: transform var(--transition-fast), border-color var(--transition-fast);
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .card:hover {
        transform: translateY(-3px);
        border-color: rgba(55, 65, 81, 0.9);
        background: rgba(17, 24, 39, 0.8);
    }

    .card h3 {
        font-size: 1.25rem;
        margin-bottom: 0.8rem;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .card p { font-size: 0.95rem; color: #cbd5e1; margin-bottom: 1rem; line-height: 1.65; }
    .card > *:last-child { margin-bottom: 0; }
    .card .activity-box, .card .tip-box, .card .question-box { margin-top: auto; }

    .card ul, .card ol {
        list-style: none;
        padding-left: 0.4rem;
        margin-bottom: 1rem;
    }

    .card li {
        position: relative;
        padding-left: 1.2rem;
        margin-bottom: 0.6rem;
        font-size: 0.92rem;
        color: #cbd5e1;
    }

    .card li::before {
        content: "•";
        position: absolute;
        left: 0;
        color: var(--accent);
        font-weight: bold;
    }

    /* Feature Boxes */
    .tip-box, .question-box, .activity-box {
        margin-top: 1.2rem;
        padding: 1rem;
        border-radius: 12px;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .tip-box {
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.2);
        color: #d1fae5;
    }
    .tip-box strong { color: #34d399; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }

    .question-box {
        background: rgba(234, 179, 8, 0.08);
        border: 1px solid rgba(234, 179, 8, 0.2);
        color: #fef08a;
    }
    .question-box strong { color: #facc15; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }

    .activity-box {
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(59, 130, 246, 0.2);
        color: #dbeafe;
    }
    .activity-box strong { color: #60a5fa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }

    .tag-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
    .tag {
        font-size: 0.7rem;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.07);
        color: #9ca3af;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Tables */
    .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border-soft); background: rgba(255, 255, 255, 0.02); }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; table-layout: fixed; }
    th { padding: 1rem; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; background: rgba(255, 255, 255, 0.05); color: var(--accent); width: 50%; white-space: nowrap; }
    td { padding: 1rem; border-bottom: 1px solid var(--border-soft); color: #cbd5e1; vertical-align: top; line-height: 1.6; }
    tr:last-child td { border-bottom: none; }
    th:not(:last-child), td:not(:last-child) { border-right: 1px solid rgba(255, 255, 255, 0.2); }
    tr:nth-child(even) td { background: rgba(255, 255, 255, 0.02); }

    /* Media Queries */
    @media (max-width: 768px) {
        .hero { grid-template-columns: 1fr; gap: 2rem; }
        .nav-inner { flex-direction: column; gap: 1rem; }
        h1 { font-size: 2.2rem; }
        .grid-ecosystem { grid-template-columns: 1fr; }
    }
    
    /* Lightbox */
    .lightbox-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); display: flex; align-items: center; justify-content: center;
        z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        backdrop-filter: blur(5px);
    }
    .lightbox-overlay.active { opacity: 1; pointer-events: all; }
    .lightbox-image {
        max-width: 90%; max-height: 90%; object-fit: contain;
        transform: scale(0.9); transition: transform 0.3s ease;
        border-radius: 8px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }
    .lightbox-overlay.active .lightbox-image { transform: scale(1); }
    .diagram-placeholder img { cursor: zoom-in; }
`;

// Helper to determine subject theme
function getThemeVars(subject) {
    switch (subject.toLowerCase()) {
        case 'mathematics': // Cyan/Blue
        case 'physics':
            return `
            --accent: #06b6d4; /* Cyan */
            --accent-soft: rgba(6, 182, 212, 0.15);
            --accent-strong: #0891b2;
            --accent-rgb: 6, 182, 212;
            `;
        case 'chemistry': // Orange/Amber
            return `
            --accent: #f59e0b; /* Amber */
            --accent-soft: rgba(245, 158, 11, 0.15);
            --accent-strong: #d97706;
            --accent-rgb: 245, 158, 11;
            `;
        case 'biology': // Emerald/Green
        default:
            return `
            --accent: #10b981; /* Emerald */
            --accent-soft: rgba(16, 185, 129, 0.15);
            --accent-strong: #059669;
            --accent-rgb: 16, 185, 129;
            `;
    }
}

function processFile(filePath, subject) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace Style Block
    const themeVars = getThemeVars(subject);
    const newStyle = `<style>
        :root {
            ${themeVars}
            --bg: #0f172a;
            --bg-soft: #111827;
            --text-main: #e5e7eb;
            --text-soft: #9ca3af;
            --card-bg: #020617;
            --border-soft: #1f2937;
            --danger: #f97373;
            --shadow-soft: 0 22px 45px rgba(15, 23, 42, 0.85);
            --radius-xl: 20px;
            --radius-lg: 16px;
            --radius-pill: 999px;
            --transition-fast: 180ms ease-out;
            --transition-med: 260ms ease-out;
        }
        ${PREMIUM_CSS_STYLES}
    </style>`;

    // Regex to Replace content inside <style>...</style>
    // Improved regex to ensure it captures everything inside <style> tags
    const styleRegex = /<style>([\s\S]*?)<\/style>/i;
    if (styleRegex.test(content)) {
        content = content.replace(styleRegex, newStyle);
    } else {
        // Inject head if missing style
        content = content.replace('</head>', `${newStyle}</head>`);
    }

    // 2. Add Scripts if missing (Lightbox/Quiz) - simplified for mass update
    const closingBody = '</body>';
    const scriptTag = `<script>
        // Lightbox Logic
        document.addEventListener('DOMContentLoaded', () => {
             // Avoid adding duplicate lightboxes
             if (document.querySelector('.lightbox-overlay')) return;
             
             const images = document.querySelectorAll('img');
             const lightbox = document.createElement('div');
             lightbox.className = 'lightbox-overlay';
             lightbox.innerHTML = '<img class="lightbox-image" src="" alt="Lightbox View">';
             document.body.appendChild(lightbox);
             
             const lightboxImg = lightbox.querySelector('img');
             
             images.forEach(img => {
                 img.addEventListener('click', () => {
                     lightboxImg.src = img.src;
                     lightbox.classList.add('active');
                 });
             });
             
             lightbox.addEventListener('click', () => {
                 lightbox.classList.remove('active');
             });
        });
    </script>`;

    if (!content.includes('lightbox-overlay')) {
        content = content.replace(closingBody, `${scriptTag}\n${closingBody}`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.basename(filePath)} (${subject})`);
}

function traverseAndApply(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            traverseAndApply(fullPath);
        } else if (item.isFile() && item.name.endsWith('.html')) {
            // Determine Subject from Parent Dir
            const parentDir = path.basename(dir);
            processFile(fullPath, parentDir);
        }
    });
}

console.log('🚀 Starting Global Premium Theme Overhaul...');
if (fs.existsSync(NOTES_DIR)) {
    traverseAndApply(NOTES_DIR);
    console.log('✨ All notes updated to Premium Dark UI.');
} else {
    console.error('❌ Notes directory not found:', NOTES_DIR);
}
