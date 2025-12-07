import API from "./api/axios";

export const classData = {
    9: {
        name: "Class IX",
        subjects: [
            {
                id: 1,
                name: "Mathematics",
                description: "Number Systems, Polynomials, Linear Equations, Geometry",
                icon: "🔢",
                notes: [
                    { id: 1, title: "Chapter 1 - Number System", file: "/grade9/Maths/Chapter - 1 Number_System.pdf" },
                    { id: 2, title: "Chapter 2 - Polynomials", file: "/grade9/Maths/Chapter - 2 Polynomials.pdf" },
                    { id: 3, title: "Chapter 3 - Coordinate Geometry", file: "/grade9/Maths/Chapter - 3 Coordinate_Geometry.pdf" },
                    { id: 4, title: "Chapter 4 - Linear Equations in Two Variables", file: "/grade9/Maths/Chapter - 4 Linear_Equations_in_Two_Variables.pdf" },
                    { id: 5, title: "Chapter 5 - Introduction to Euclid's Geometry", file: "/grade9/Maths/Chapter - 5 Introduction_to_Euclid_s_Geometry.pdf" },
                    { id: 6, title: "Chapter 6 - Lines and Angles", file: "/grade9/Maths/Chapter - 6 Lines_and_Angles.pdf" },
                    { id: 7, title: "Chapter 7 - Triangles", file: "/grade9/Maths/Chapter - 7 Triangles.pdf" },
                    { id: 8, title: "Chapter 8 - Quadrilaterals", file: "/grade9/Maths/Chapter - 8 Quadrilaterals.pdf" },
                    { id: 9, title: "Chapter 9 - Areas of Parallelograms and Triangles", file: "/grade9/Maths/Chapter - 9 Areas_of_Parallelograms_and_Triangles.pdf" },
                    { id: 10, title: "Chapter 10 - Circles", file: "/grade9/Maths/Chapter - 10 Circles.pdf" },
                    { id: 11, title: "Chapter 11 - Geometric Constructions", file: "/grade9/Maths/Chapter - 11 Geometric_Constructions.pdf" },
                    { id: 12, title: "Chapter 12 - Heron's Formula", file: "/grade9/Maths/Chapter - 12 Heron_s_Formula.pdf" },
                    { id: 13, title: "Chapter 13 - Surface Areas and Volumes", file: "/grade9/Maths/Chapter - 13 Surface_Areas_and_Volumes.pdf" },
                    { id: 14, title: "Chapter 14 - Statistics", file: "/grade9/Maths/Chapter - 14 Statistics.pdf" },
                    { id: 15, title: "Chapter 15 - Probability", file: "/grade9/Maths/Chapter - 15 Probability.pdf" },
                ],
            },
            {
                id: 2,
                name: "Science",
                description: "Physics, Chemistry, Biology",
                icon: "🧪",
                hasSubSubjects: true,
                subSubjects: [
                    {
                        id: 21,
                        name: "Physics",
                        icon: "⚡",
                        color: "blue",
                        notes: [
                            { id: 1, title: "Chapter 1 - Motion", file: "/grade9/notes/Physics/Chapter - 1 Motion.pdf" },
                            { id: 2, title: "Chapter 2 - Force and Laws of Motion", file: "/grade9/notes/Physics/Chapter - 2 Force_and_Laws_of_Motion.pdf" },
                            { id: 3, title: "Chapter 3 - Gravitation", file: "/grade9/notes/Physics/Chapter - 3 Gravitation.pdf" },
                            { id: 4, title: "Chapter 4 - Work and Energy", file: "/grade9/notes/Physics/Chapter - 4 Work_and_Energy.pdf" },
                            { id: 5, title: "Chapter 5 - Sound", file: "/grade9/notes/Physics/Chapter - 5 Sound.pdf" },
                        ],
                    },
                    {
                        id: 22,
                        name: "Chemistry",
                        icon: "🧪",
                        color: "purple",
                        notes: [
                            { id: 1, title: "Chapter 1 - Matter in Our Surroundings", file: "/grade9/notes/Chemistry/Chapter_1_Matter_in_Our_Surroundings.pdf" },
                            { id: 2, title: "Chapter 2 - Is Matter Around Us Pure", file: "/grade9/notes/Chemistry/Chapter_2_Is_Matter_Around_Us_Pure.pdf" },
                            { id: 3, title: "Chapter 3 - Atoms and Molecules", file: "/grade9/notes/Chemistry/Chapter_3_Atoms_and_Molecules.pdf" },
                            { id: 4, title: "Chapter 4 - Structure of the Atom", file: "/grade9/notes/Chemistry/Chapter_4_Structure_of_the_Atom.pdf" },
                        ],
                    },
                    {
                        id: 23,
                        name: "Biology",
                        icon: "🌿",
                        color: "green",
                        notes: [
                            { id: 1, title: "Chapter 1 - The Fundamental Unit of Life", file: "/grade9/notes/Biology/Chapter-1-The-Fundamental-Unit-of-Life.html", isHTML: true },
                            { id: 2, title: "Chapter 2 - Tissues", file: "/grade9/notes/Biology/Chapter - 2 Tissues.pdf" },
                            { id: 3, title: "Chapter 3 - Diversity in Living Organisms", file: "/grade9/notes/Biology/Chapter - 3 Diversity_in_Living_Organisms.pdf" },
                            { id: 4, title: "Chapter 4 - Why Do We Fall Ill", file: "/grade9/notes/Biology/Chapter - 4 Why_Do_We_Fall_Ill.pdf" },
                            { id: 5, title: "Chapter 5 - Natural Resources", file: "/grade9/notes/Biology/Chapter - 5 Natural_Resources_updated.pdf" },
                            { id: 6, title: "Chapter 6 - Improvement in Food Resources", file: "/grade9/notes/Biology/Chapter - 6 Improvement_in_Food_Resources-.pdf" },
                        ],
                    },
                ],
            },
        ],
    },
    10: {
        name: "Class X",
        subjects: [
            {
                id: 3,
                name: "Mathematics",
                description: "Real Numbers, Polynomials, Trigonometry, Statistics",
                icon: "🔢",
                notes: [],
            },
            {
                id: 4,
                name: "Science",
                description: "Physics, Chemistry, Biology",
                icon: "🧪",
                hasSubSubjects: true,
                subSubjects: [
                    {
                        id: 41,
                        name: "Physics",
                        icon: "⚡",
                        color: "blue",
                        notes: [
                            { id: 1, title: "Chapter 9 - Light (Reflection and Refraction)", file: "/grade10/notes/Physics/Chapter-1-Light.html", isHTML: true },
                            { id: 2, title: "Chapter 10 - The Human Eye and the Colourful World", file: "/grade10/notes/Physics/Chapter-2-Human-Eye.html", isHTML: true },
                            { id: 3, title: "Chapter 11 - Electricity", file: "/grade10/notes/Physics/Chapter-11-Electricity.html", isHTML: true },
                            { id: 4, title: "Chapter 12 - Magnetic Effects of Electric Current", file: "/grade10/notes/Physics/Chapter-12-Magnetism.html", isHTML: true },
                        ],
                    },
                    {
                        id: 42,
                        name: "Chemistry",
                        icon: "🧪",
                        color: "purple",
                        notes: [
                            { id: 1, title: "Chapter 1 - Chemical Reactions and Equations", file: "/grade10/notes/Chemistry/Chapter-1-Chemical-Reactions.html", isHTML: true },
                            { id: 2, title: "Chapter 2 - Acids, Bases and Salts", file: "/grade10/notes/Chemistry/Chapter-2-Acids-Bases.html", isHTML: true },
                            { id: 3, title: "Chapter 3 - Metals and Non-metals", file: "/grade10/notes/Chemistry/Chapter-3-Metals-Non-metals.html", isHTML: true },
                            { id: 4, title: "Chapter 4 - Carbon and its Compounds", file: "/grade10/notes/Chemistry/Chapter-4-Carbon.html", isHTML: true },
                        ],
                    },
                    {
                        id: 43,
                        name: "Biology",
                        icon: "🌿",
                        color: "green",
                        notes: [
                            { id: 1, title: "Chapter 5 - Life Processes", file: "/grade10/notes/Biology/Chapter-5-Life-Processes.html", isHTML: true },
                            { id: 2, title: "Chapter 6 - Control and Coordination", file: "/grade10/notes/Biology/Chapter-6-Control-Coordination.html", isHTML: true },
                            { id: 3, title: "Chapter 7 - How do Organisms Reproduce?", file: "/grade10/notes/Biology/Chapter-7-Reproduction.html", isHTML: true },
                            { id: 4, title: "Chapter 8 - Heredity and Evolution", file: "/grade10/notes/Biology/Chapter-8-Heredity.html", isHTML: true },
                            { id: 5, title: "Chapter 13 - Our Environment", file: "/grade10/notes/Biology/Chapter-13-Environment.html", isHTML: true },
                        ],
                    },
                ],
            },
        ],
    },
};

export const initClassProgress = async (classId, subjects) => {
    try {
        return await API.post("/progress/initSemester", {
            classId: classId,
            subjects,
        });
    } catch (error) {
        console.error("Error initializing class progress:", error);
    }
};

export const fetchClassProgress = async (userClass) => {
    try {
        const response = await API.get(
            `/progress/getSemesterProgress?classId=${userClass}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching class progress:", error);
        throw error;
    }
};

export const fetchSubjectProgress = async (classId) => {
    try {
        const response = await API.get(
            `/progress/getSubjectProgress?classId=${classId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching subject progress:", error);
        throw error;
    }
};

export const markLectureWatched = async (data) => {
    try {
        const response = await API.post("/progress/markLectureWatched", data);
        return response.data;
    } catch (error) {
        console.error("Error marking lecture as watched:", error);
        throw error;
    }
};

export const markNoteRead = async (data) => {
    try {
        const response = await API.post("/progress/markNoteRead", data);
        return response.data;
    } catch (error) {
        console.error("Error marking note as read:", error);
        throw error;
    }
};
