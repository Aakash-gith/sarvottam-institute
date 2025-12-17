const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../../update_quiz_chapter4.js');
console.log('Reading source from:', sourcePath);
const sourceContent = fs.readFileSync(sourcePath, 'utf8');

// We cut off the script before it actually does anything (the `const filePath` part)
const splitMarker = 'const filePath = path.join';
const splitIdx = sourceContent.indexOf(splitMarker);

if (splitIdx === -1) {
    console.error('Split marker not found');
    process.exit(1);
}

// contentHeader contains imports and the `const htmlContent` variable definition.
const contentHeader = sourceContent.substring(0, splitIdx);

const newLogic = `
const TARGET_FILE = path.resolve(__dirname, '../../grade10/notes/Chemistry/Chapter-4-Carbon.html');

function restore() {
    const dir = path.dirname(TARGET_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TARGET_FILE, htmlContent, 'utf8');
    console.log('✅ Restored Chapter 4 content.');
}

function updateColors() {
    if (!fs.existsSync(TARGET_FILE)) {
        console.error('Target file not found for update.');
        return;
    }
    let content = fs.readFileSync(TARGET_FILE, 'utf8');
    const replacements = [
        ['#22c55e', '#3b82f6'],
        ['rgba(34, 197, 94', 'rgba(59, 130, 246'],
        ['rgba(34,197,94', 'rgba(59,130,246'],
        ['#16a34a', '#2563eb'],
        ['#bbf7d0', '#93c5fd'],
        ['#022c22', '#0c1e3d']
    ];

    let count = 0;
    replacements.forEach(([oldColor, newColor]) => {
        const safeOld = oldColor.replace(/[.*+?^\\\${}()|[\\]\\\\]/g, '\\\\$&');
        const regex = new RegExp(safeOld, 'g');
        if (regex.test(content)) {
            const matches = content.match(regex);
            count += matches ? matches.length : 0;
            content = content.replace(regex, newColor);
        }
    });
    
    fs.writeFileSync(TARGET_FILE, content, 'utf8');
    console.log(\`✅ Updated colors to blue theme (\${count} replacements).\`);
}

const args = process.argv.slice(2);

if (args.includes('--restore')) {
    restore();
}

if (args.includes('--update-colors')) {
    updateColors();
}

if (args.includes('--all')) {
    restore();
    updateColors();
}

if (args.length === 0 || args.includes('--help')) {
    console.log(\`
Usage: node chapter_4_manager.js [options]

Options:
  --restore           Restore Chapter 4 to the canonical version
  --update-colors     Convert green theme colors to blue
  --all               Run restore and update-colors
  --help              Show this help
    \`);
}
`;

const finalContent = contentHeader + newLogic;

const destPath = path.join(__dirname, 'chapter_4_manager.js');
fs.writeFileSync(destPath, finalContent, 'utf8');
console.log('Created chapter_4_manager.js');
