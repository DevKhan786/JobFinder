import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    auth0Id: {
      type: String,
      required: true,
      unique: true,
    },
    appliedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    role: {
      type: String,
      enum: ["jobseeker", "recruiter"],
      default: "jobseeker",
    },
    resume: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      default: "No bio provided",
    },
    profession: {
      type: String,
      default: "No profession provided",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
