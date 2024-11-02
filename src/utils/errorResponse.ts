import { HTTP_STATUS } from "../config/constants";

export const errorResponse = (
  res: any,
  error: any,
  message: string,
  status = HTTP_STATUS.INTERNAL_SERVER_ERROR
) => {
  return res.status(status).json({
    success: false,
    message,
    error: error?.message || "An unexpected error occurred",
  });
};
