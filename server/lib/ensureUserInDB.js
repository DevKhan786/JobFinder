import User from "../models/UserModel.js";
import asyncHandler from "express-async-handler"; // Import asyncHandler if you don't have it

export const ensureUserInDB = asyncHandler(async (user) => {
  try {
    const existingUser = await User.findOne({ auth0Id: user.sub });

    if (!existingUser) {
      const newUser = new User({
        auth0Id: user.sub,
        email: user.email,
        name: user.name,
        role: "jobseeker", // Default role, adjust as necessary
        profilePicture: user.picture,
      });

      await newUser.save();
      console.log("User added to DB", user);
    } else {
      console.log("User already exists in DB", existingUser);
    }
  } catch (error) {
    console.log("Error adding user to DB", error.message);
  }
});
