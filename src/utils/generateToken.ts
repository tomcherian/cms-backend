import jwt from "jsonwebtoken";
import { UserRole } from "../types/roles";

interface TokenPayload {
  id: string;
  role: UserRole;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
