import asyncHandler from "express-async-handler";
import Job from "../models/JobModel.js";
import User from "../models/UserModel.js";

export const createJob = asyncHandler(async (req, res) => {
  try {
    // Find the user based on their auth0Id (assuming user is authenticated)
    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new job based on the data from the request body
    const {
      title,
      location,
      salary,
      salaryType,
      negotiable,
      jobType,
      description,
      tags,
      skills,
    } = req.body;

    // Error validation only for required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!salary) {
      return res.status(400).json({ message: "Salary is required" });
    }

    if (!jobType) {
      return res.status(400).json({ message: "Job Type is required" });
    }

    if (!skills) {
      return res.status(400).json({ message: "Skills are required" });
    }

    const newJob = new Job({
      title,
      location: location || "Remote", // Default to 'Remote' if not provided
      salary,
      salaryType: salaryType || "Year", // Default to 'Year' if not provided
      negotiable: negotiable || false, // Default to false if not provided
      jobType,
      description,
      tags: tags || [],
      skills,
      createdBy: user._id,
    });

    // Save the new job to the database
    await newJob.save();

    return res
      .status(201)
      .json({ message: "Job created successfully", job: newJob });
  } catch (error) {
    console.log("Error in createJob controller", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

export const getJobs = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate("createdBy", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ jobs });
  } catch (error) {
    console.log("Error in getJobs controller", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

export const getJobsByUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const jobs = await Job.find({ createdBy: user._id }).populate(
      "createdBy",
      "name profilePicture"
    );

    return res.status(200).json(jobs);
  } catch (error) {
    console.log("Error in getJobsByUser", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const searchJobs = asyncHandler(async (req, res) => {
  try {
    const { tags, location, title } = req.query;

    // Initialize an empty query object
    let query = {};

    // Filter by tags (if provided)
    if (tags) {
      query.tags = { $in: tags.split(",") }; // Match any job that has one of the specified tags
    }

    // Filter by location (if provided)
    if (location) {
      query.location = { $regex: new RegExp(location, "i") }; // Case-insensitive match for location
    }

    // Filter by title (if provided)
    if (title) {
      query.title = { $regex: new RegExp(title, "i") }; // Case-insensitive match for title
    }

    // Search the jobs collection with the constructed query
    const jobs = await Job.find(query)
      .populate("createdBy", "name profilePicture") // Optionally populate user data
      .sort({ createdAt: -1 }); // Sort jobs by creation date (latest first)

    // Return the filtered jobs
    return res.status(200).json({ jobs });
  } catch (error) {
    console.log("Error in searchJobs: ", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
});

export const applyJob = asyncHandler(async (req, res) => {
  try {
    // Find the job and validate existence
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Find the user using their auth0Id
    const user = await User.findOne({ auth0Id: req.oidc.user.sub });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure user is a jobseeker
    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can apply for jobs" });
    }

    // Check if the user has already applied for the job
    if (job.applicants.includes(user._id)) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    // Check if the job is already in the user's appliedJobs
    if (user.appliedJobs.includes(job._id)) {
      return res
        .status(400)
        .json({ message: "Job already exists in user's applied jobs" });
    }

    // Add user to job's applicants list
    job.applicants.push(user._id);

    // Add job to user's appliedJobs list
    user.appliedJobs.push(job._id);

    // Save updates to both documents
    await job.save();
    await user.save();

    return res.status(200).json({ message: "Application successful", job });
  } catch (error) {
    console.log("Error in applyJob: ", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

export const likeJob = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isLiked = job.likes.includes(user._id);

    if (isLiked) {
      job.likes = job.likes.filter((like) => !like.equals(user._id));
    } else {
      job.likes.push(user._id);
    }

    await job.save();

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error in likeJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// get job by id
export const getJobById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate(
      "createdBy",
      "name profilePicture"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error in getJobById: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});

// delete job
export const deleteJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await job.deleteOne({
      _id: id,
    });

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.log("Error in deleteJob: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});
