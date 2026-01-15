import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Assignment from "@/models/Assignment";
import Subject from "@/models/Subject";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await context.params;

    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify ownership via subject
    const subject = await Subject.findOne({
      _id: assignment.subjectId,
      teacherId: authUser.userId,
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    if (assignment.status === "PUBLISHED") {
      return NextResponse.json(
        { message: "Assignment already published" },
        { status: 400 }
      );
    }

    assignment.status = "PUBLISHED";
    await assignment.save();

    return NextResponse.json({ message: "Assignment published" });
  } catch (error) {
    console.error("PUBLISH_ASSIGNMENT_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}