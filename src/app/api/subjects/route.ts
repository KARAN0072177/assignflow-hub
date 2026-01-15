import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Subject from "@/models/Subject";
import crypto from "crypto";

function generateJoinCode() {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function POST(req: Request) {
    try {
        const authUser = getAuthUser(req);

        // 1️⃣ Auth check
        if (!authUser || authUser.role !== "TEACHER") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name } = body;

        if (!name || name.length < 2) {
            return NextResponse.json(
                { message: "Subject name is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // 2️⃣ Generate unique join code
        let joinCode: string;
        let exists = true;

        do {
            joinCode = generateJoinCode();
            const check = await Subject.findOne({ joinCode });
            exists = !!check;
        } while (exists);

        // 3️⃣ Create subject
        const subject = await Subject.create({
            name,
            teacherId: authUser.userId,
            joinCode,
        });

        return NextResponse.json(
            {
                id: subject._id,
                name: subject.name,
                joinCode: subject.joinCode,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE_SUBJECT_ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser || authUser.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const subjects = await Subject.find({
      teacherId: authUser.userId,
    })
      .sort({ createdAt: -1 })
      .select("_id name joinCode createdAt");

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("GET_SUBJECTS_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}