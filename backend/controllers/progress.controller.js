import Progress from "../models/Progress.js";

// ----  set all subjects in progress ----
export const initSemesterProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { classId, subjects } = req.body;

    if (!classId || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const clsId = parseInt(classId, 10);
    const newSubjectIds = subjects.map((s) => s.id);


    const existingProgress = await Progress.find({
      studentId: userId,
      classId: clsId,
    });

    const existingIds = existingProgress.map((p) => p.subjectId);


    const toAdd = newSubjectIds.filter((id) => !existingIds.includes(id));

    const toRemove = existingIds.filter((id) => !newSubjectIds.includes(id));

    if (toAdd.length > 0) {
      const bulkAdd = toAdd.map((subjectId) => ({
        updateOne: {
          filter: { studentId: userId, classId: clsId, subjectId },
          update: {
            $setOnInsert: {
              studentId: userId,
              classId: clsId,
              subjectId,
              notesCompleted: [],
              videosCompleted: [],
              notesRead: 0,
              lecturesWatched: 0,
              completion: 0,
            },
          },
          upsert: true,
        },
      }));
      await Progress.bulkWrite(bulkAdd);
    }

    if (toRemove.length > 0) {
      await Progress.deleteMany({
        studentId: userId,
        classId: clsId,
        subjectId: { $in: toRemove },
      });
    }

    const updated = await Progress.find({
      studentId: userId,
      classId: clsId,
    }).sort({ subjectId: 1 });

    return res.status(200).json({
      message: "Class progress synced successfully",
      added: toAdd,
      removed: toRemove,
      progress: updated,
    });
  } catch (error) {
    console.error("syncSemesterProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ----  compute completion for a subject ----
const computeCompletion = ({
  totalNotes = 0,
  totalLectures = 0,
  notesCompletedCount = 0,
  videosCompletedCount = 0,
}) => {
  const totalItems = totalNotes + totalLectures;
  if (totalItems === 0) return undefined;

  const completed = notesCompletedCount + videosCompletedCount;
  const raw = (completed / totalItems) * 100;

  return Math.max(0, Math.min(100, Math.round(raw)));
};

// ---- overall semester progress ----
export const getSemesterProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ message: "Class parameter required" });
    }

    const classIdNum = parseInt(classId, 10);

    const progressRecords = await Progress.find({
      studentId: userId,
      classId: classIdNum,
    });

    if (progressRecords.length === 0) {
      return res.status(200).json({
        completion: 0,
        classId: classIdNum,
        studentId: userId,
      });
    }

    const completions = progressRecords.map((r) =>
      typeof r.completion === "number" ? r.completion : 0
    );
    const avg = completions.reduce((sum, v) => sum + v, 0) / completions.length;

    return res.status(200).json({
      completion: Math.round(avg),
      classId: classIdNum,
      studentId: userId,
      subjectCount: progressRecords.length,
    });
  } catch (error) {
    console.error("getSemesterProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----  subject progress for a semester ----
export const getSubjectProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { classId } = req.query;
    if (!classId) {
      return res
        .status(400)
        .json({ message: "Class ID parameter required" });
    }

    const classIdNum = parseInt(classId, 10);

    const progressRecords = await Progress.find({
      studentId: userId,
      classId: classIdNum,
    }).sort({ subjectId: 1 });

    return res.status(200).json(progressRecords);
  } catch (error) {
    console.error("getSubjectProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----  specific subject progress ----
export const getSubjectProgressById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subjectId } = req.params;

    const progress = await Progress.findOne({
      studentId: userId,
      subjectId: parseInt(subjectId, 10),
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    return res.status(200).json(progress);
  } catch (error) {
    console.error("getSubjectProgressById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---- mark a note as read  ----
export const markNoteRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subjectId, classId, noteId, totalNotes, totalLectures } =
      req.body;

    if (!subjectId || !classId || !noteId) {
      return res.status(400).json({
        message: "subjectId, classId and noteId are required",
      });
    }

    const subjectIdNum = parseInt(subjectId, 10);
    const classIdNum = parseInt(classId, 10);
    const noteIdStr = String(noteId);
    const totalNotesNum = parseInt(totalNotes, 10) || 0;
    const totalLecturesNum = parseInt(totalLectures, 10) || 0;

    let progress = await Progress.findOne({
      studentId: userId,
      subjectId: subjectIdNum,
      classId: classIdNum,
    });

    // If no doc exists yet, create one with this note marked
    if (!progress) {
      const notesCompleted = [noteIdStr];
      const videosCompleted = [];

      const completion = computeCompletion({
        totalNotes: totalNotesNum,
        totalLectures: totalLecturesNum,
        notesCompletedCount: notesCompleted.length,
        videosCompletedCount: videosCompleted.length,
      });

      progress = await Progress.create({
        studentId: userId,
        subjectId: subjectIdNum,
        classId: classIdNum,
        notesRead: 1,
        lecturesWatched: 0,
        notesCompleted,
        videosCompleted,
        completion: typeof completion === "number" ? completion : 0,
        lastUpdated: new Date(),
      });

      return res.status(200).json({ message: "Note marked as read", progress });
    }

    // Check if already marked
    const isAlreadyMarked = Array.isArray(progress.notesCompleted) && progress.notesCompleted.includes(noteIdStr);
    let isChanged = false;

    if (!isAlreadyMarked) {
      progress.notesCompleted.push(noteIdStr);
      // Remove from In Progress if it exists there
      if (progress.notesInProgress && progress.notesInProgress.includes(noteIdStr)) {
        progress.notesInProgress = progress.notesInProgress.filter(id => id !== noteIdStr);
      }
      progress.notesRead = progress.notesCompleted.length; // Sync count with array
      isChanged = true;
    }

    // Always re-calculate completion to self-correct if totals changed
    const completion = computeCompletion({
      totalNotes: totalNotesNum,
      totalLectures: totalLecturesNum,
      notesCompletedCount: progress.notesCompleted.length,
      videosCompletedCount: progress.videosCompleted?.length || 0,
    });

    if (typeof completion === "number" && progress.completion !== completion) {
      progress.completion = completion;
      isChanged = true;
    }

    if (isChanged) {
      progress.lastUpdated = new Date();
      // Force Mongoose to recognize the array change if needed
      if (!isAlreadyMarked) {
        progress.notesCompleted = [...progress.notesCompleted];
        progress.notesInProgress = [...(progress.notesInProgress || [])];
      }
      await progress.save();
    }

    return res.status(200).json({ message: isAlreadyMarked ? "Note already marked" : "Note marked as read", progress });
  } catch (error) {
    console.error("markNoteRead error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ---- mark note in progress ----
export const markNoteInProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { subjectId, classId, noteId } = req.body;
    if (!subjectId || !classId || !noteId) {
      return res.status(400).json({ message: "subjectId, classId and noteId required" });
    }

    const subjectIdNum = parseInt(subjectId, 10);
    const classIdNum = parseInt(classId, 10);
    const noteIdStr = String(noteId);

    let progress = await Progress.findOne({
      studentId: userId,
      subjectId: subjectIdNum,
      classId: classIdNum,
    });

    if (!progress) {
      // Create new record
      progress = new Progress({
        studentId: userId,
        subjectId: subjectIdNum,
        classId: classIdNum,
        notesInProgress: [noteIdStr],
        lastUpdated: new Date()
      });
      await progress.save();
      return res.status(200).json({ message: "Note marked in progress", progress });
    }

    // If already completed, ignore (or could move back to in-progress if that's desired behavior? User said "when marked complete, in progress should be normalised", implying removed from in-progress. But if moving FROM complete TO in-progress? Let's assume this is strictly for "Starting" a chapter).
    // For now: If completed, don't mark in progress.
    if (progress.notesCompleted && progress.notesCompleted.includes(noteIdStr)) {
      return res.status(200).json({ message: "Note already completed", progress });
    }

    // Add to in-progress if not already there
    if (!progress.notesInProgress) progress.notesInProgress = [];
    if (!progress.notesInProgress.includes(noteIdStr)) {
      progress.notesInProgress.push(noteIdStr);
      progress.lastUpdated = new Date();
      await progress.save();
    }

    return res.status(200).json({ message: "Note marked in progress", progress });

  } catch (error) {
    console.error("markNoteInProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ----  mark a lecture video as watched ----

export const markLectureWatched = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subjectId, classId, videoId, totalNotes, totalLectures } =
      req.body;

    if (!subjectId || !classId || !videoId) {
      return res.status(400).json({
        message: "subjectId, classId and videoId are required",
      });
    }

    const subjectIdNum = parseInt(subjectId, 10);
    const classIdNum = parseInt(classId, 10);
    const videoIdStr = String(videoId);
    const totalNotesNum = parseInt(totalNotes, 10) || 0;
    const totalLecturesNum = parseInt(totalLectures, 10) || 0;

    let progress = await Progress.findOne({
      studentId: userId,
      subjectId: subjectIdNum,
      classId: classIdNum,
    });

    // Create if not exists
    if (!progress) {
      const videosCompleted = [videoIdStr];
      const notesCompleted = [];

      const completion = computeCompletion({
        totalNotes: totalNotesNum,
        totalLectures: totalLecturesNum,
        notesCompletedCount: notesCompleted.length,
        videosCompletedCount: videosCompleted.length,
      });

      progress = await Progress.create({
        studentId: userId,
        subjectId: subjectIdNum,
        classId: classIdNum,
        lecturesWatched: 1,
        notesRead: 0,
        notesCompleted,
        videosCompleted,
        completion: typeof completion === "number" ? completion : 0,
        lastUpdated: new Date(),
      });

      return res
        .status(200)
        .json({ message: "Lecture marked as watched", progress });
    }

    // Check if already marked
    const isAlreadyMarked = Array.isArray(progress.videosCompleted) && progress.videosCompleted.includes(videoIdStr);
    let isChanged = false;

    if (!isAlreadyMarked) {
      progress.videosCompleted.push(videoIdStr);
      // Remove from In Progress
      if (progress.videosInProgress && progress.videosInProgress.includes(videoIdStr)) {
        progress.videosInProgress = progress.videosInProgress.filter(id => id !== videoIdStr);
      }
      progress.lecturesWatched = progress.videosCompleted.length; // Sync count
      isChanged = true;
    }

    // Always re-calculate completion
    const completion = computeCompletion({
      totalNotes: totalNotesNum,
      totalLectures: totalLecturesNum,
      notesCompletedCount: progress.notesCompleted?.length || 0,
      videosCompletedCount: progress.videosCompleted.length,
    });

    if (typeof completion === "number" && progress.completion !== completion) {
      progress.completion = completion;
      isChanged = true;
    }

    if (isChanged) {
      progress.lastUpdated = new Date();
      if (!isAlreadyMarked) {
        progress.videosCompleted = [...progress.videosCompleted];
        progress.videosInProgress = [...(progress.videosInProgress || [])];
      }
      await progress.save();
    }

    return res
      .status(200)
      .json({ message: isAlreadyMarked ? "Lecture already watched" : "Lecture marked as watched", progress });
  } catch (error) {
    console.error("markLectureWatched error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---- mark video in progress ----
export const markLectureInProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { subjectId, classId, videoId } = req.body;
    if (!subjectId || !classId || !videoId) {
      return res.status(400).json({ message: "subjectId, classId and videoId required" });
    }

    const subjectIdNum = parseInt(subjectId, 10);
    const classIdNum = parseInt(classId, 10);
    const videoIdStr = String(videoId);

    let progress = await Progress.findOne({
      studentId: userId,
      subjectId: subjectIdNum,
      classId: classIdNum,
    });

    if (!progress) {
      // Create new
      progress = new Progress({
        studentId: userId,
        subjectId: subjectIdNum,
        classId: classIdNum,
        videosInProgress: [videoIdStr],
        lastUpdated: new Date()
      });
      await progress.save();
      return res.status(200).json({ message: "Video marked in progress", progress });
    }

    if (progress.videosCompleted && progress.videosCompleted.includes(videoIdStr)) {
      return res.status(200).json({ message: "Video already completed", progress });
    }

    if (!progress.videosInProgress) progress.videosInProgress = [];
    if (!progress.videosInProgress.includes(videoIdStr)) {
      progress.videosInProgress.push(videoIdStr);
      progress.lastUpdated = new Date();
      await progress.save();
    }

    return res.status(200).json({ message: "Video marked in progress", progress });

  } catch (error) {
    console.error("markLectureInProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
