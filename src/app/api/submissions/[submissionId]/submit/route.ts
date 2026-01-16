import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Submission from "@/models/Submission";
import Assignment from "@/models/Assignment";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await context.params;

    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // 1️⃣ Fetch submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Ownership check
    if (submission.studentId.toString() !== authUser.userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // 3️⃣ Status check
    if (submission.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Submission already finalized" },
        { status: 400 }
      );
    }

    // 4️⃣ Validate assignment + deadline
    const assignment = await Assignment.findById(
      submission.assignmentId
    );

    if (!assignment) {
      return NextResponse.json(
        { message: "Invalid assignment" },
        { status: 400 }
      );
    }

    if (new Date() > assignment.deadline) {
      submission.status = "LOCKED";
      await submission.save();

      return NextResponse.json(
        { message: "Deadline passed. Submission locked." },
        { status: 400 }
      );
    }

    // 5️⃣ Ensure submission has content
    const hasFile = !!submission.fileUrl;
    const hasText =
      submission.textAnswer &&
      submission.textAnswer.trim().length > 0;

    if (!hasFile && !hasText) {
      return NextResponse.json(
        { message: "Submission is empty" },
        { status: 400 }
      );
    }

    // 6️⃣ Finalize submission
    submission.status = "SUBMITTED";
    submission.submittedAt = new Date();
    await submission.save();

    return NextResponse.json({
      message: "Submission submitted successfully",
    });
  } catch (error) {
    console.error("SUBMIT_SUBMISSION_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}