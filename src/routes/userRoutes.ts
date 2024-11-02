import authMiddleware from "../middlewares/authMiddleware";
import {
  createUser,
  forgotPassword,
  loginUser,
  logout,
  resetPassword,
  verifyAccount,
} from "../controllers/userController";
import { Router } from "express";

const userRoutes = Router();

userRoutes.post("/create-account", createUser);
userRoutes.post("/verify-account/:token", verifyAccount);
userRoutes.post("/login", loginUser);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password/:token", resetPassword);
userRoutes.get("/logout", authMiddleware, logout);

export default userRoutes;
