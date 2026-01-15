import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Assignment from "@/models/Assignment";
import Subject from "@/models/Subject";

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser || authUser.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      subjectId,
      title,
      description,
      deadline,
      fileKey,
      fileName,
      fileType,
    } = await req.json();

    if (!subjectId || !title || !deadline || !fileKey) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify subject ownership
    const subject = await Subject.findOne({
      _id: subjectId,
      teacherId: authUser.userId,
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Invalid subject" },
        { status: 403 }
      );
    }

    const assignment = await Assignment.create({
      subjectId,
      title,
      description,
      deadline,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`,
      fileName,
      fileType,
      status: "DRAFT",
    });

    return NextResponse.json(
      { id: assignment._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_ASSIGNMENT_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}