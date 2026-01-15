import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import SubjectEnrollment from "@/models/SubjectEnrollment";
import Assignment from "@/models/Assignment";

export async function GET(
  req: Request,
  context: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { subjectId } = await context.params;

    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // 1️⃣ Check enrollment
    const enrollment = await SubjectEnrollment.findOne({
      subjectId,
      studentId: authUser.userId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // 2️⃣ Fetch published assignments
    const assignments = await Assignment.find({
      subjectId,
      status: "PUBLISHED",
    })
      .sort({ createdAt: -1 })
      .select("title description deadline fileUrl fileName");

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("STUDENT_ASSIGNMENTS_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}