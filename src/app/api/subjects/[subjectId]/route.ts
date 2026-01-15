import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Subject from "@/models/Subject";

export async function GET(
  req: Request,
  context: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { subjectId } = await context.params; // ✅ AWAIT here

    const authUser = getAuthUser(req);

    if (!authUser || authUser.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const subject = await Subject.findOne({
      _id: subjectId,
      teacherId: authUser.userId,
    }).select("name joinCode");

    if (!subject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subject });
  } catch (error) {
    console.error("GET_SUBJECT_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}