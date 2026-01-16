import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Subject from "@/models/Subject";
import User from "@/models/User";
import "@/models/User";

export async function GET(
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

    // 1️⃣ Validate assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Verify subject ownership
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

    // 3️⃣ Fetch submissions
    const submissions = await Submission.find({
      assignmentId,
    })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    const result = submissions.map((s) => ({
      id: s._id,
      student: s.studentId,
      status: s.status,
      submittedAt: s.submittedAt,
    }));

    return NextResponse.json({ submissions: result });
  } catch (error) {
    console.error("TEACHER_SUBMISSION_LIST_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}