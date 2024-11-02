import { verify } from "jsonwebtoken";
import { model, Schema } from "mongoose";

const usrSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verifyToken: String,
    verified: { type: Boolean, default: false },
    verifyTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

export const User = model("User", usrSchema);
