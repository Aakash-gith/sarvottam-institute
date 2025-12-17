import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/Users.js";
import SubjectNotes from "./models/SubjectNotes.js";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const countHtmlFiles = async (dir) => {
    let count = 0;
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const res = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                count += await countHtmlFiles(res);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                count++;
            }
        }
    } catch (e) {
        console.warn(`Error reading dir ${dir}:`, e.message);
    }
    return count;
};

const debug = async () => {
    try {
        const grade10Path = path.join(__dirname, "..", "grade10");
        console.log("Checking path G10:", grade10Path);
        const grade10HtmlCount = await countHtmlFiles(grade10Path);
        console.log("Grade 10 HTML Files:", grade10HtmlCount);

        const grade9Path = path.join(__dirname, "..", "grade9");
        console.log("Checking path G9:", grade9Path);
        const grade9HtmlCount = await countHtmlFiles(grade9Path);
        console.log("Grade 9 HTML Files:", grade9HtmlCount);

    } catch (err) {
        console.error("Debug Error:", err);
    }
};

debug();
