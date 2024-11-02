import jwt from "jsonwebtoken";

export const accessTokenAndSetCookie = async (res: any, userId: string) => {
  try {
    const token = await jwt.sign(
      {
        _id: userId,
      },
      process.env.JWT_TOKEN,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return token;
  } catch (error) {
    throw new Error("Error while creating access token and setting cookie");
  }
};
