import {jwtVerify} from "jose";

export const validateToken = async (token: string | undefined): Promise<string | null> => {
  console.log("-------------token-----------", token);
  try {
    if (!token) {
      return null
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log("-------------payload-----------", payload);
    return payload.user_id as string;
  } catch (err) {
    console.log("-------------error-----------", err);
    return null;
  }
};
