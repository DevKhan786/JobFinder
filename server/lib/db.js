import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const ConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongoose running at", conn.connection.host);
  } catch (error) {
    console.log("Error in ConnectDB ", error);

    process.exit(1);
  }
};
