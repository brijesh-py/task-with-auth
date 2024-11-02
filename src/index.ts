import { configDotenv } from "dotenv";
import connectDB from "./config/db";
import app from "./app";

configDotenv();

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
