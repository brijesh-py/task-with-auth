import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import taskRoutes from "./routes/taskRoutes";
import authMiddleware from "./middlewares/authMiddleware";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRoutes);
app.use("/api/v1/", authMiddleware, taskRoutes);
app.use("/test", (req, res) => {
  res.status(200).json({
    message: "test",
  });
});

export default app;
