import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ConnectDB } from "./lib/db.js";
import { auth } from "express-openid-connect";
import cookieParser from "cookie-parser";
import userRoutes from "../server/routes/userRoutes.js";
import jobRoutes from "../server/routes/jobRoutes.js";
import { ensureUserInDB } from "./lib/ensureUserInDB.js";
import asyncHandler from "express-async-handler";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

app.use(auth(config));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Middleware to ensure user is in the DB
app.use(
  "/api/auth/check-auth",
  asyncHandler(async (req, res, next) => {
    const user = req.oidc.user;
    if (user) {
      await ensureUserInDB(user);
    }
    next();
  })
);

app.use("/api/auth", userRoutes);
app.use("/api/job", jobRoutes);

const serverStart = async () => {
  try {
    await ConnectDB();
    app.listen(PORT, () => {
      console.log(`Server running on PORT`, PORT);
    });
  } catch (error) {
    console.log("Error in serverStart", error);
    process.exit(1);
  }
};

serverStart();
