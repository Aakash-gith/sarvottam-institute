import express from "express";
import {
  getSemesterProgress,
  getSubjectProgress,
  getSubjectProgressById,
  //   updateSubjectProgress,
  markNoteRead,
  markLectureWatched,
  markNoteInProgress,
  markLectureInProgress,
  initSemesterProgress,
} from "../controllers/progress.controller.js";

const progressRoutes = express.Router();

// Protect all routes
progressRoutes.post("/initSemester", initSemesterProgress);

progressRoutes.get("/getSemesterProgress", getSemesterProgress);
progressRoutes.get("/getSubjectProgress", getSubjectProgress);
progressRoutes.get(
  "/getSubjectProgressById/:subjectId",
  getSubjectProgressById
);
// progressRoutes.put("/updateSubjectProgress/:subjectId", updateSubjectProgress);
progressRoutes.post("/markNoteRead", markNoteRead);
progressRoutes.post("/markLectureWatched", markLectureWatched);
progressRoutes.post("/markNoteInProgress", markNoteInProgress);
progressRoutes.post("/markLectureInProgress", markLectureInProgress);

export default progressRoutes;
