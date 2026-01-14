import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        trim: true,
    },
    definition: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        default: "",
    },
});

const masterySetSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        subjectId: {
            type: Number,
            required: true,
        },
        classId: {
            type: Number,
            required: true,
        },
        chapterId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        cards: [cardSchema],
        summary: {
            type: String,
            default: "",
        },
        keyQuestions: [
            {
                question: String,
                answer: String,
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser",
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

masterySetSchema.index({ subjectId: 1, classId: 1 });
masterySetSchema.index({ title: "text" });

const MasterySet = mongoose.model("MasterySet", masterySetSchema);
export default MasterySet;
