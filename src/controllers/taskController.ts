import Task from "../models/task";
import { HTTP_STATUS, MESSAGES } from "../config/constants";
import { errorResponse } from "../utils/errorResponse";

const filterQueries = (req: any) => {
  const userId = req?.user; // Adjust this based on your auth implementation
  const { q, dueDate, status, priority } = req?.query;
  const queries: Record<string, any> = { userId };

  if (q) {
    queries.title = { $regex: q, $options: "i" }; // Makes the query case-insensitive
  }
  if (status) {
    queries.status = status;
  }
  if (dueDate) {
    queries.dueDate = new Date(dueDate); // Ensure dueDate is in Date format
  }
  if (priority) {
    queries.priority = priority;
  }
  return queries;
};

const createTask = async (req: any, res: any) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user;

    if (!title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        any: false,
        message: "Title is required",
      });
    }

    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      userId,
    });
    await newTask.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.CREATING_TASK,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_CREATING_TASK);
  }
};

const getAllTasks = async (req: any, res: any) => {
  try {
    const queries = filterQueries(req);
    const { page } = req.query < 1 ? 1 : req.query;

    const tasksCount = await Task.countDocuments(queries);
    if (tasksCount === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        tasks: [],
        message: MESSAGES.TASK_NOT_FOUND,
      });
    }

    const tasksPerPage = 10;
    const pages = Math.ceil(tasksCount / tasksPerPage);
    const skip = (page - 1) * tasksPerPage;

    const tasks =
      (await Task.find(queries)
        .limit(tasksPerPage)
        .skip(skip)
        ?.select("-userId -__v")) || [];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      tasks,
      message: MESSAGES.TASK_FETCHED,
      hits: tasks.length,
      pages,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_FETCHING_TASK);
  }
};

const getTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.TASK_NOT_FOUND,
      });
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      task,
      message: MESSAGES.TASK_FETCHED,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_FETCHING_TASK);
  }
};

const deleteTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.TASK_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.DELETING_TASK,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_DELETING_TASK);
  }
};

const updateTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(id, {
      title,
      description,
      status,
      priority,
      dueDate,
    });
    if (!task) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.TASK_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.UPDATING_TASK,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_UPDATING_TASK);
  }
};

export { createTask, getAllTasks, getTask, deleteTask, updateTask };
