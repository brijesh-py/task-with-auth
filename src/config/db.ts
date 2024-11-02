import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const response = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("DB connected");
  } catch (err) {
    throw new Error(err?.message);
    process.exit(1);
  }
};

export default connectDB;
