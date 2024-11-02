import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/user";
import { accessTokenAndSetCookie } from "../utils/accessTokenAndSetCookie";
import { HTTP_STATUS, MESSAGES } from "../config/constants";
import { errorResponse } from "../utils/errorResponse";

// Utility to generate a token and its expiry date
const generateToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  return { token, expires };
};

const createUser = async (req: any, res: any) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.REQUIRED_FIELDS,
      });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: MESSAGES.USER_EXISTS,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { token: verifyToken, expires: verifyTokenExpires } = generateToken();

    // send verifyToken on email

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      verifyTokenExpires,
      verifyToken,
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      user: {
        name: newUser?.name,
        username: newUser?.username,
        email: newUser?.email,
      },
      message: MESSAGES.ACCOUNT_CREATED,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_CREATING_ACCOUNT);
  }
};

const verifyAccount = async (req: any, res: any) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpires: { $gt: new Date() }, // Check if token has not expired
    });
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.INVALID_TOKEN,
      });
    }

    user.verified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.ACCOUNT_VERIFIED,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_VERIFYING_ACCOUNT);
  }
};

const loginUser = async (req: any, res: any) => {
  try {
    const { user, password } = req.body;

    const userFound = await User.findOne({
      $or: [{ username: user }, { email: user }],
    });
    if (!userFound) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS,
      });
    }

    const isMatch = await bcrypt.compare(password, userFound?.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS,
      });
    }

    const token = await accessTokenAndSetCookie(res, userFound?._id.toString());
    res.status(HTTP_STATUS.OK).json({
      success: true,
      user: {
        name: userFound?.name,
        username: userFound?.username,
        email: userFound?.email,
      },
      message: MESSAGES.LOGIN_SUCCESS,
      token,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_LOGGING_IN);
  }
};

const forgotPassword = async (req: any, res: any) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.INVALID_CREDENTIALS,
      });
    }

    const { token, expires } = generateToken();
    userExists.resetPasswordToken = token;
    userExists.resetPasswordExpires = expires;
    await userExists.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.FORGOT_PASSWORD,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_FORGOT_PASSWORD);
  }
};

const resetPassword = async (req: any, res: any) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Check if token has not expired
    });
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.INVALID_TOKEN,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.PASSWORD_RESET,
    });
  } catch (error) {
    errorResponse(res, error, MESSAGES.ERROR_RESET_PASSWORD);
  }
};

const logout = async (req: any, res: any) => {
  res.removeCookie("token").status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logout successfully",
  });
};

export {
  createUser,
  verifyAccount,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
};
