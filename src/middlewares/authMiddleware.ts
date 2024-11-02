import jwt from "jsonwebtoken";
import { HTTP_STATUS, MESSAGES } from "../config/constants";
import { errorResponse } from "../utils/errorResponse";

const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization.replace("Bearer ", "");
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
      });
    }

    const decode: any = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode?._id) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
      });
    }
    
    req.user = decode?._id;
    next();
  } catch (error) {
    return errorResponse(res, error, MESSAGES.ERROR_AUTHORIZED);
  }
};

export default authMiddleware;
