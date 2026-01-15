import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export type AuthUser = {
  userId: string;
  role: "TEACHER" | "STUDENT";
};

export function getAuthUser(req: Request): AuthUser | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      role: "TEACHER" | "STUDENT";
    };

    return { userId: decoded.sub, role: decoded.role };
  } catch {
    return null;
  }
}