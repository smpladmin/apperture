import {jwtVerify} from "jose";

export const validateToken = async (token: string | undefined): Promise<string | null> => {
  try {
    if (!token) {
      return null
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.user_id as string;
  } catch (err) {
    return null;
  }
};
