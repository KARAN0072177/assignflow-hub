import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Submission from "@/models/Submission";
import Assignment from "@/models/Assignment";
import SubjectEnrollment from "@/models/SubjectEnrollment";

/* =========================
   GET — Fetch existing draft
========================= */
export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { message: "assignmentId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await Submission.findOne({
      assignmentId,
      studentId: authUser.userId,
    }).select(
      "_id textAnswer fileUrl fileName fileType status"
    );

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("GET_SUBMISSION_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — Save / update draft
========================= */
export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      assignmentId,
      fileKey,
      fileName,
      fileType,
      textAnswer,
    } = await req.json();

    if (!assignmentId) {
      return NextResponse.json(
        { message: "Assignment ID required" },
        { status: 400 }
      );
    }

    await connectDB();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Invalid assignment" },
        { status: 400 }
      );
    }

    const enrolled = await SubjectEnrollment.findOne({
      subjectId: assignment.subjectId,
      studentId: authUser.userId,
    });

    if (!enrolled) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const submission = await Submission.findOneAndUpdate(
      {
        assignmentId,
        studentId: authUser.userId,
      },
      {
        fileUrl: fileKey
          ? `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`
          : undefined,
        fileName,
        fileType,
        textAnswer,
        status: "DRAFT",
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      message: "Submission saved as draft",
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("SAVE_SUBMISSION_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}