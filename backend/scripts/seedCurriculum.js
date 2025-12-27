
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const syllabusData = {
    "Class 9": [
        {
            subject: "Maths",
            chapters: [
                "Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables",
                "Introduction to Euclid’s Geometry", "Lines and Angles", "Triangles", "Quadrilaterals",
                "Areas of Parallelograms and Triangles", "Circles", "Constructions", "Heron’s Formula",
                "Surface Areas and Volumes", "Statistics", "Probability"
            ]
        },
        {
            subject: "Physics",
            chapters: ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"]
        },
        {
            subject: "Chemistry",
            chapters: ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom"]
        },
        {
            subject: "Biology",
            chapters: ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Why Do We Fall Ill", "Natural Resources", "Improvement in Food Resources"]
        }
    ],
    "Class 10": [
        {
            subject: "Maths",
            chapters: [
                "Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations",
                "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Trigonometric Identities",
                "Some Applications of Trigonometry", "Circles", "Constructions", "Areas Related to Circles",
                "Surface Areas and Volumes", "Statistics", "Probability"
            ]
        },
        {
            subject: "Physics",
            chapters: ["Light – Reflection and Refraction", "The Human Eye and the Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy"]
        },
        {
            subject: "Chemistry",
            chapters: ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements"]
        },
        {
            subject: "Biology",
            chapters: ["Life Processes", "Control and Coordination", "How do Organisms Reproduce", "Heredity and Evolution", "Our Environment", "Management of Natural Resources"]
        }
    ]
};

const generateSampleContent = (type) => {
    switch (type) {
        case 'video': return { type: 'video', title: "Introduction & Key Concepts", url: "https://youtu.be/K-gW0iT2j9M", duration: "20:00", isFree: true };
        case 'note': return { type: 'note', title: "Chapter Revision Notes", url: "https://example.com/note.pdf", isFree: true };
        case 'test': return { type: 'test', title: "Chapter Practice Test", duration: "30 mins", isFree: false };
        case 'quiz': return { type: 'test', title: "Daily Quiz 1", duration: "10 mins", isFree: true }; // Using 'test' type for quiz as placeholder or if schema supports 'quiz' type, but schema only has ['video', 'live', 'note', 'test']. User request says "Quiz" tab. 
        // NOTE: Schema limitation. 'quiz' type not in enum. I'll use 'test' with title "Quiz" or similar, OR strict enum. 
        // User asked for "Quiz tab". I should probably update schema later, but for now let's map 'test' for both or add 'quiz' to schema. 
        // Wait, I can't change schema without restarting backend and potentially migration. Schema allows: enum: ['video', 'live', 'note', 'test']. 
        // I will use 'test' for now and distinguishing by title or just putting into 'test' slots. 
        // Actually, to make "Quiz" tab work with separate content, I'll need to update schema or reuse 'test'. 
        // Let's use 'test' type but different titles. 
        default: return null;
    }
};

const buildCurriculum = (classLevel) => {
    const modules = syllabusData[classLevel] || syllabusData["Class 10"];
    return modules.map(mod => ({
        subject: mod.subject,
        chapters: mod.chapters.map(chTitle => ({
            title: chTitle,
            description: `Comprehensive study material for ${chTitle}.`,
            contents: [
                { ...generateSampleContent('video'), title: `Intro to ${chTitle}` },
                { ...generateSampleContent('note'), title: `${chTitle} Notes` },
                { ...generateSampleContent('test'), title: `${chTitle} Practice Test` },
                { ...generateSampleContent('test'), title: `Quiz: ${chTitle} Basics` } // Reusing test type
            ]
        }))
    }));
};


const seedCurriculum = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses.`);

        for (const course of courses) {
            console.log(`Processing: ${course.title} (${course.classLevel})`);

            // Determine strict syllabus based on class
            let targetClass = course.classLevel;
            if (targetClass !== "Class 9" && targetClass !== "Class 10") {
                targetClass = "Class 10"; // Default
            }

            course.curriculum = buildCurriculum(targetClass);

            // Add features
            if (!course.features) course.features = [];
            const newFeatures = ["Chapter-wise Notes", "Live & Recorded Classes", "Regular Tests & Quizzes"];
            newFeatures.forEach(f => {
                if (!course.features.includes(f)) course.features.push(f);
            });

            // Validation Fixes
            if (!course.validityValue) { course.validityValue = '365'; course.validityMode = 'days'; }
            if (!course.subject) course.subject = 'All';
            if (course.price === undefined) course.price = 0;
            if (!course.classLevel) course.classLevel = 'Class 10';

            try {
                await course.save();
                console.log(`✅ Updated ${course.title} with strict syllabus`);
            } catch (err) {
                console.error(`❌ Failed/Error ${course.title}:`, err.message);
            }
        }

        console.log("Seeding complete.");
        process.exit(0);

    } catch (error) {
        console.error("Error seeding:", error);
        process.exit(1);
    }
};

seedCurriculum();
