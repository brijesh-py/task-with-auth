import { Router } from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from "../controllers/taskController";

const taskRoutes = Router();

taskRoutes.post("/task", createTask);
taskRoutes.get("/tasks", getAllTasks);
taskRoutes.get("/task/:id", getTask);
taskRoutes.delete("/task/:id", deleteTask);
taskRoutes.put("/task/:id", updateTask);

export default taskRoutes;
