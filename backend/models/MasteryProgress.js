import mongoose from "mongoose";

const masteryProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        setId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MasterySet",
            required: true,
        },
        knownCards: [Number],
        strugglingCards: [Number],
        bestMatchTime: {
            type: Number,
            default: null,
        },
        lastStudied: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

masteryProgressSchema.index({ userId: 1, setId: 1 }, { unique: true });

const MasteryProgress = mongoose.model("MasteryProgress", masteryProgressSchema);
export default MasteryProgress;
