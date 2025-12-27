import Course from '../models/Course.js';
import CourseProgress from '../models/CourseProgress.js';

// Helper: Calculate Progress
const calculateStats = async (course, progressDoc) => {
    const weights = course.progressSettings?.weights || { video: 30, note: 20, test: 30, assignment: 20 };
    const completedIds = new Set(progressDoc.completedContents.map(c => c.contentId.toString()));

    let totalCourseProgress = 0;
    let totalSubjects = 0;
    const subjectStats = [];
    const chapterStats = [];

    // Iterate Curriculum
    course.curriculum.forEach(subjectModule => {
        let totalSubjectChapterProgress = 0;
        let totalSubjectChapters = 0;

        subjectModule.chapters.forEach(chapter => {
            // Count items by type
            const counts = { video: 0, note: 0, test: 0, assignment: 0 };
            const completed = { video: 0, note: 0, test: 0, assignment: 0 };
            let hasItems = false;

            chapter.contents.forEach(content => {
                const type = content.type === 'live' ? 'video' : content.type; // Treat live as video for now
                if (counts[type] !== undefined) {
                    counts[type]++;
                    hasItems = true;
                    if (completedIds.has(content._id.toString())) {
                        completed[type]++;
                    }
                }
            });

            // Calculate Chapter %
            let currentWeightSum = 0;
            let maxWeightSum = 0;

            Object.keys(weights).forEach(key => {
                if (counts[key] > 0) {
                    const weight = weights[key];
                    maxWeightSum += weight;
                    currentWeightSum += (completed[key] / counts[key]) * weight;
                }
            });

            // Normalize to 100%
            const chapterPercentage = maxWeightSum > 0 ? (currentWeightSum / maxWeightSum) * 100 : (hasItems ? 0 : 100);

            // Status
            let status = 'not_started';
            if (chapterPercentage === 100) status = 'completed';
            else if (chapterPercentage > 0) status = 'in_progress';

            chapterStats.push({
                subject: subjectModule.subject,
                chapterTitle: chapter.title,
                percentage: Math.round(chapterPercentage),
                status
            });

            totalSubjectChapterProgress += chapterPercentage;
            if (hasItems) totalSubjectChapters++;
        });

        const subjectPercentage = totalSubjectChapters > 0 ? (totalSubjectChapterProgress / totalSubjectChapters) : 0;
        subjectStats.push({
            subject: subjectModule.subject,
            percentage: Math.round(subjectPercentage)
        });

        if (totalSubjectChapters > 0) {
            totalCourseProgress += subjectPercentage;
            totalSubjects++;
        }
    });

    const overallProgress = totalSubjects > 0 ? (totalCourseProgress / totalSubjects) : 0;

    // Update Document
    progressDoc.chapterProgress = chapterStats;
    progressDoc.subjectProgress = subjectStats;
    progressDoc.overallProgress = Math.round(overallProgress);

    return progressDoc;
};

export const updateContentProgress = async (req, res) => {
    try {
        const { courseId, contentId, type, score } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        let progress = await CourseProgress.findOne({ user: userId, course: courseId });
        if (!progress) {
            progress = new CourseProgress({ user: userId, course: courseId, completedContents: [] });
        }

        // Check if already completed
        const existingIndex = progress.completedContents.findIndex(c => c.contentId.toString() === contentId);
        if (existingIndex > -1) {
            // Update existing (e.g. better score)
            if (score !== undefined) {
                progress.completedContents[existingIndex].score = score;
                progress.completedContents[existingIndex].completedAt = Date.now();
            }
        } else {
            // Add new
            progress.completedContents.push({ contentId, type, score });
        }

        // Recalculate
        progress = await calculateStats(course, progress);
        progress.lastActiveAt = Date.now();
        await progress.save();

        res.status(200).json(progress);

    } catch (error) {
        console.error("Progress update error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        let progress = await CourseProgress.findOne({ user: userId, course: courseId });
        if (!progress) {
            // Return empty init structure
            return res.status(200).json({
                completedContents: [],
                chapterProgress: [],
                subjectProgress: [],
                overallProgress: 0
            });
        }
        res.status(200).json(progress);
    } catch (error) {
        console.error("Get progress error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
