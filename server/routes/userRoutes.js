import express from "express";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/check-auth", (req, res) => {
  try {
    if (req.oidc.isAuthenticated()) {
      return res
        .status(200)
        .json({ isAuthenticated: true, user: req.oidc.user });
    } else {
      return res.status(401).json({
        isAuthenticated: false,
        message: "User is not authenticated",
      });
    }
  } catch (error) {
    console.log("Error in check-auth", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/user/:id", getUserProfile);

export default router;
