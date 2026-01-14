import MasterySet from "../models/MasterySet.js";
import MasteryProgress from "../models/MasteryProgress.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate Mastery Content using AI (Flashcards + Summary + Q&A)
export const generateMasteryCards = async (req, res) => {
    try {
        const { topic, textContent, count = 10 } = req.body;

        if (!topic && !textContent) {
            return res.status(400).json({ success: false, message: "Topic or text content required" });
        }

        const systemPrompt = `You are an expert academic assistant for Class 9 and 10 students (NCERT/CBSE). 
Your goal is to create a complete and comprehensive study set based on the provided topic or text.

A complete set MUST cover ALL subtopics explicitly mentioned in the text or generally associated with the topic.
It includes:
1. Flashcards (Mastery Cards): A term and a concise definition.
2. Revision Notes: A well-structured, exhaustive markdown summary (bullet points, bold highlights) that covers every subtopic and key concept in depth.
3. Expert Q&A (Key Questions): Detailed questions and answers that often appear in exams.

Response Format:
Return ONLY a valid JSON object with the following structure:
{
  "cards": [
    { "term": "Concept Name", "definition": "Clear explanation" }
  ],
  "summary": "Full comprehensive revision notes here...",
  "keyQuestions": [
    { "question": "Deep conceptual question?", "answer": "Comprehensive answer..." }
  ]
}

Constraints:
- Flashcards: Concise, max 20 words per definition.
- Revision Notes: Structured with markdown headers (###), bullet points, and key terms in bold. Must be comprehensive.
- Key Questions: Focus on "Why" and "How" questions typical of Class 10 boards.`;

        const userPrompt = textContent
            ? `Generate a comprehensive study set for the topic "${topic}" based on this reference text: "${textContent.substring(0, 6000)}". Include ${count} cards.`
            : `Generate a comprehensive study set for the topic: "${topic}". Include ${count} cards.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        let result;
        try {
            result = JSON.parse(content);
        } catch (e) {
            throw new Error("Failed to parse AI response");
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate content", error: error.message });
    }
};

// Create a new Mastery Set
export const createMasterySet = async (req, res) => {
    try {
        const { title, description, subjectId, classId, cards, chapterId, summary, keyQuestions } = req.body;

        const newSet = new MasterySet({
            title,
            description,
            subjectId,
            classId,
            cards,
            chapterId,
            summary,
            keyQuestions,
            createdBy: req.user?._id
        });

        await newSet.save();
        res.status(201).json({ success: true, data: newSet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all sets for a specific class and subject
export const getMasterySets = async (req, res) => {
    try {
        const { subjectId, classId } = req.query;
        const query = {};
        if (subjectId) query.subjectId = subjectId;
        if (classId) query.classId = classId;

        const sets = await MasterySet.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: sets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single set with user progress
export const getMasterySetById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const set = await MasterySet.findById(id);
        if (!set) return res.status(404).json({ success: false, message: "Set not found" });

        const progress = await MasteryProgress.findOne({ userId, setId: id });

        res.status(200).json({
            success: true,
            data: {
                ...set.toObject(),
                userProgress: progress || { knownCards: [], strugglingCards: [], bestMatchTime: null }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update card progress (marked as known or struggling)
export const updateCardStatus = async (req, res) => {
    try {
        const { setId } = req.params;
        const { cardIndex, status } = req.body;
        const userId = req.user._id;

        let progress = await MasteryProgress.findOne({ userId, setId });
        if (!progress) {
            progress = new MasteryProgress({ userId, setId, knownCards: [], strugglingCards: [] });
        }

        progress.knownCards = progress.knownCards.filter(i => i !== cardIndex);
        progress.strugglingCards = progress.strugglingCards.filter(i => i !== cardIndex);

        if (status === 'known') {
            progress.knownCards.push(cardIndex);
        } else if (status === 'struggling') {
            progress.strugglingCards.push(cardIndex);
        }

        progress.lastStudied = new Date();
        await progress.save();

        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Record Match Game time
export const updateMatchTime = async (req, res) => {
    try {
        const { setId } = req.params;
        const { time } = req.body;
        const userId = req.user._id;

        let progress = await MasteryProgress.findOne({ userId, setId });
        if (!progress) {
            progress = new MasteryProgress({ userId, setId });
        }

        if (!progress.bestMatchTime || time < progress.bestMatchTime) {
            progress.bestMatchTime = time;
        }

        progress.lastStudied = new Date();
        await progress.save();

        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a Mastery Set
export const deleteMasterySet = async (req, res) => {
    try {
        const { id } = req.params;
        const set = await MasterySet.findById(id);

        if (!set) {
            return res.status(404).json({ success: false, message: "Set not found" });
        }

        // Check if the user is the creator (Basic security)
        if (set.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this set" });
        }

        await MasterySet.findByIdAndDelete(id);

        // Also clean up progress for this set
        await MasteryProgress.deleteMany({ setId: id });

        res.status(200).json({ success: true, message: "Set deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
