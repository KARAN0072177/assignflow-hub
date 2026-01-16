import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { fileName, fileType } = await req.json();

    if (!fileName || fileType !== "application/pdf") {
      return NextResponse.json(
        { message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const fileKey = `submissions/${authUser.userId}/${crypto.randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5,
    });

    return NextResponse.json({
      uploadUrl,
      fileKey,
    });
  } catch (error) {
    console.error("SUBMISSION_UPLOAD_URL_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}