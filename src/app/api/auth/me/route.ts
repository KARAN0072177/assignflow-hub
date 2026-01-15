import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      role: "STUDENT" | "TEACHER";
    };

    return NextResponse.json({
      user: {
        id: decoded.sub,
        role: decoded.role,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}