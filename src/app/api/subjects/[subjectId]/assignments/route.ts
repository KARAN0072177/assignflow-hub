import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Subject from "@/models/Subject";
import Assignment from "@/models/Assignment";

export async function GET(
  req: Request,
  context: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { subjectId } = await context.params;

    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // 1️⃣ Verify subject ownership
    const subject = await Subject.findOne({
      _id: subjectId,
      teacherId: authUser.userId,
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Fetch assignments
    const assignments = await Assignment.find({
      subjectId,
    })
      .sort({ createdAt: -1 })
      .select("title deadline status createdAt");

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("GET_ASSIGNMENTS_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}