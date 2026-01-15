import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Subject from "@/models/Subject";
import SubjectEnrollment from "@/models/SubjectEnrollment";

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);

    // 1️⃣ Auth + role check
    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { joinCode } = body;

    if (!joinCode) {
      return NextResponse.json(
        { message: "Join code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 2️⃣ Find subject
    const subject = await Subject.findOne({
      joinCode,
      isActive: true,
    });

    if (!subject) {
      return NextResponse.json(
        { message: "Invalid or expired join code" },
        { status: 404 }
      );
    }

    // 3️⃣ Prevent duplicate join
    const alreadyJoined = await SubjectEnrollment.findOne({
      subjectId: subject._id,
      studentId: authUser.userId,
    });

    if (alreadyJoined) {
      return NextResponse.json(
        { message: "You have already joined this subject" },
        { status: 409 }
      );
    }

    // 4️⃣ Create enrollment
    await SubjectEnrollment.create({
      subjectId: subject._id,
      studentId: authUser.userId,
    });

    return NextResponse.json(
      {
        message: "Successfully joined subject",
        subject: {
          id: subject._id,
          name: subject.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("JOIN_SUBJECT_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}