import jwt from "jsonwebtoken";

export const isValidToken = (token: string | undefined): boolean => {
  try {
    return !!token && !!jwt.verify(token, process.env.JWT_SECRET!!);
  } catch (err) {
    return false;
  }
};
