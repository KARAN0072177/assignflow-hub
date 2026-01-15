import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import SubjectEnrollment from "@/models/SubjectEnrollment";

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser || authUser.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const enrollments = await SubjectEnrollment.find({
      studentId: authUser.userId,
    })
      .populate("subjectId", "name")
      .sort({ joinedAt: -1 });

    const subjects = enrollments.map((en) => ({
      id: en.subjectId._id,
      name: (en.subjectId as any).name,
    }));

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("GET_JOINED_SUBJECTS_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}