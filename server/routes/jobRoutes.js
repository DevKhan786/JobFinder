import express from "express";
import {
  applyJob,
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  getJobsByUser,
  likeJob,
  searchJobs,
} from "../controllers/jobController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.post("/jobs", protect, createJob);
router.get("/jobs", getJobs);
router.get("/jobs/user/:id", getJobsByUser);
router.get("/jobs/search", searchJobs);
router.put("/jobs/apply/:id", protect, applyJob);
router.put("/jobs/like/:id", protect, likeJob);
router.get("/jobs/:id", protect, getJobById);
router.delete("/jobs/:id", protect, deleteJob);

export default router;
