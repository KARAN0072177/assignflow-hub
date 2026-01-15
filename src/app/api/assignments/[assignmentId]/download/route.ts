import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import SubjectEnrollment from "@/models/SubjectEnrollment";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  req: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await context.params;

    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // verify student enrollment
    const enrolled = await SubjectEnrollment.findOne({
      subjectId: assignment.subjectId,
      studentId: authUser.userId,
    });

    if (!enrolled) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const key = assignment.fileUrl.split(".amazonaws.com/")[1];

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to generate download link" },
      { status: 500 }
    );
  }
}