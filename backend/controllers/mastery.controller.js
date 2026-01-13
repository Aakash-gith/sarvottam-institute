import MasterySet from "../models/MasterySet.js";
import MasteryProgress from "../models/MasteryProgress.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate Flashcards using AI
export const generateMasteryCards = async (req, res) => {
    try {
        const { topic, textContent, count = 10 } = req.body;

        if (!topic && !textContent) {
            return res.status(400).json({ success: false, message: "Topic or text content required" });
        }

        const systemPrompt = `You are an expert academic assistant for Class 9 and 10 students. 
Your goal is to create highly effective study flashcards (Mastery Cards) based on the provided topic or text.
Each card must have a "term" (the concept/word) and a "definition" (the explanation).

Response Format:
Return ONLY a valid JSON object with a "cards" property containing an array of objects. Do not include markdown code blocks or any other text.
{
  "cards": [
    { "term": "Concept Name", "definition": "Clear, concise definition or explanation" }
  ]
}

Constraints:
- Maximum 25 words per definition.
- Focused on CBSE/NCERT curriculum.
- Clear and easy to understand.`;

        const userPrompt = topic
            ? `Generate ${count} mastery cards for the topic: "${topic}".`
            : `Generate ${count} mastery cards based on the following text: "${textContent.substring(0, 4000)}"`;

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
        let cards;
        try {
            const parsed = JSON.parse(content);
            cards = parsed.cards || [];
        } catch (e) {
            throw new Error("Failed to parse AI response");
        }

        res.status(200).json({ success: true, data: cards });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate cards", error: error.message });
    }
};

// Create a new Mastery Set
export const createMasterySet = async (req, res) => {
    try {
        const { title, description, subjectId, classId, cards, chapterId } = req.body;

        const newSet = new MasterySet({
            title,
            description,
            subjectId,
            classId,
            cards,
            chapterId,
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
